const { Lease, LeaseStatus, Property, User, Notification, NotificationType, Transaction, TransactionStatus, TransactionType } = require('../models');
const { apiResponse } = require('../utils/apiResponse');
const emailService = require('../services/email.service');
const { triggerOwnerNotification } = require('../services/pusher.service');
const { addTimelineEntry, recalcPropertyStatus, hasOverlappingConfirmedRent } = require('../services/transaction.service');

const isAdminish = (role) => ['ADMIN', 'AGENCY'].includes(role);

const formatAmount = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/A';
  return `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} TND`;
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-GB');
};

const getDisplayName = (user) => {
  if (!user) return 'Unknown user';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return fullName || user.login || user.email || 'User';
};

const buildPropertyLabel = (property) => {
  if (!property) return 'property';
  return property.title || property.reference || 'property';
};

const logSideEffectError = (context, error) => {
  console.error(`[lease:${context}]`, error?.message || error);
};

const CALENDAR_VISIBLE_STATUSES = [LeaseStatus.PENDING, LeaseStatus.CONFIRMED, LeaseStatus.COMPLETED];

const normalizeDate = (value, fallback) => {
  const date = value ? new Date(value) : new Date(fallback);
  if (Number.isNaN(date.getTime())) return new Date(fallback);
  return date;
};

const getLeaseCalendarColor = (status) => {
  switch (status) {
    case LeaseStatus.CONFIRMED:
      return 'Success';
    case LeaseStatus.COMPLETED:
      return 'Primary';
    case LeaseStatus.PENDING:
    default:
      return 'Warning';
  }
};

const toCalendarEvent = (lease, viewerRole) => {
  const tenantName = getDisplayName(lease.tenantId);
  const property = lease.propertyId || {};
  const propertyLabel = buildPropertyLabel(property);
  const isTenantView = ['TENANT', 'BUYER'].includes(String(viewerRole || '').toUpperCase());

  return {
    id: String(lease._id),
    title: isTenantView
      ? `${propertyLabel}`
      : `${tenantName} - ${propertyLabel}`,
    start: lease.startDate,
    end: lease.endDate,
    allDay: true,
    status: lease.status,
    colorKey: getLeaseCalendarColor(lease.status),
    tenant: {
      id: lease.tenantId?._id || null,
      name: tenantName,
      email: lease.tenantId?.email || '',
      phone: lease.tenantId?.phone || '',
    },
    property: {
      id: property._id || null,
      title: property.title || '',
      reference: property.reference || '',
      city: property.city || '',
      listingType: property.listingType || '',
    },
    rentAmount: lease.rentAmount,
    charges: lease.charges,
    createdAt: lease.createdAt,
    updatedAt: lease.updatedAt,
  };
};

/** Tenant cannot open a new request if a non-cancelled pending request exists, or rental period (end date) has not passed yet. */
const findBlockingLeaseForTenant = async (propertyId, tenantId) => {
  const candidates = await Lease.find({
    propertyId,
    tenantId,
    status: { $ne: LeaseStatus.CANCELLED },
  }).lean();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return candidates.find((l) => {
    if (l.status === LeaseStatus.PENDING) return true;
    const end = new Date(l.endDate);
    end.setHours(0, 0, 0, 0);
    return end >= today;
  });
};

const mapLeaseStatusToTransactionStatus = (status) => {
  switch (status) {
    case 'CONFIRMED':
      return TransactionStatus.CONFIRMED;
    case 'COMPLETED':
      return TransactionStatus.COMPLETED;
    case 'CANCELLED':
      return TransactionStatus.CANCELLED;
    default:
      return TransactionStatus.PENDING;
  }
};

const createLeaseTransaction = async ({ lease, property, tenantId, actorId }) => {
  const transaction = new Transaction({
    propertyId: property._id,
    ownerId: property.createdBy || null,
    partyId: tenantId,
    type: TransactionType.RENT,
    amount: lease.rentAmount,
    currency: 'TND',
    startDate: lease.startDate,
    endDate: lease.endDate,
    status: mapLeaseStatusToTransactionStatus(lease.status),
    timeline: [],
  });

  addTimelineEntry(transaction, transaction.status, actorId, 'Lease created');
  await transaction.save();
  return transaction;
};

const syncLeaseTransactionStatus = async ({ lease, actorId, note }) => {
  if (!lease.transactionId) return null;
  const transaction = await Transaction.findById(lease.transactionId);
  if (!transaction) return null;

  const nextStatus = mapLeaseStatusToTransactionStatus(lease.status);

  // Prevent premature completion: only allow COMPLETED once the rental period has ended
  if (
    nextStatus === TransactionStatus.COMPLETED &&
    lease.endDate &&
    new Date(lease.endDate) > new Date()
  ) {
    throw new Error('Lease cannot be completed before the end date');
  }

  transaction.status = nextStatus;
  addTimelineEntry(transaction, nextStatus, actorId, note || `Lease set to ${nextStatus}`);

  if (transaction.type === TransactionType.RENT && nextStatus === TransactionStatus.CONFIRMED) {
    const overlap = await hasOverlappingConfirmedRent(transaction);
    if (overlap) {
      throw new Error('This rental period overlaps an existing confirmed rental');
    }
  }

  await transaction.save();
  await recalcPropertyStatus(transaction.propertyId);
  return transaction;
};

// @desc    Confirm lease (owner/admin)
// @route   PATCH /api/leases/:id/confirm
// @access  Private
exports.confirmLease = async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id);
    if (!lease) {
      return res.status(404).json(apiResponse(false, 'Lease not found'));
    }

    const property = await Property.findById(lease.propertyId);
    const isOwner = property && property.createdBy && property.createdBy.equals(req.user._id);
    const adminish = ['ADMIN', 'AGENCY'].includes(req.user.role);
    if (!isOwner && !adminish) {
      return res.status(403).json(apiResponse(false, 'Only owner or admin/agency can confirm'));
    }

    lease.status = LeaseStatus.CONFIRMED;
    await lease.save();

    try {
      await syncLeaseTransactionStatus({ lease, actorId: req.user._id, note: 'Lease confirmed' });
    } catch (err) {
      return res.status(400).json(apiResponse(false, err.message || 'Unable to confirm lease'));
    }

    if (property) {
      await recalcPropertyStatus(property._id);
    }

    const populatedLease = await Lease.findById(lease._id)
      .populate('propertyId', 'reference title city type price status')
      .populate('tenantId', 'login email firstName lastName phone')
      .populate('transactionId');

    return res.status(200).json(apiResponse(true, 'Lease confirmed', populatedLease));
  } catch (error) {
    next(error);
  }
};

async function dispatchLeaseSideEffects({ lease, property, tenant, owner }) {
  const propertyLabel = buildPropertyLabel(property);
  const rentLabel = formatAmount(lease.rentAmount);
  const chargesLabel = lease.charges ? formatAmount(lease.charges) : '0 TND';
  const startLabel = formatDate(lease.startDate);
  const endLabel = formatDate(lease.endDate);
  const tenantName = getDisplayName(tenant);
  const ownerName = owner ? getDisplayName(owner) : null;

  const payloadBase = {
    id: String(lease._id),
    type: NotificationType.LEASE_CREATED,
    propertyId: String(property._id),
    propertyTitle: propertyLabel,
    rentAmount: lease.rentAmount,
    charges: lease.charges,
    startDate: lease.startDate,
    endDate: lease.endDate,
    status: lease.status,
    createdAt: lease.createdAt || new Date(),
  };

  const asyncTasks = [];

  if (owner) {
    asyncTasks.push(
      Notification.create({
        type: NotificationType.LEASE_CREATED,
        recipientId: owner._id,
        propertyId: property._id,
        senderUserId: tenant?._id,
        senderName: tenantName,
        senderEmail: tenant?.email || process.env.EMAIL_FROM || 'noreply@smartproperty.local',
        senderPhone: tenant?.phone || '',
        message: `${tenantName} booked ${propertyLabel} from ${startLabel} to ${endLabel}.`,
      }).catch((error) => logSideEffectError('owner-notification', error))
    );

    asyncTasks.push(
      triggerOwnerNotification(String(owner._id), {
        ...payloadBase,
        authorName: tenantName,
        authorEmail: tenant?.email,
        message: `${tenantName} booked ${propertyLabel}.`,
      }).catch((error) => logSideEffectError('owner-pusher', error))
    );

    if (owner.email) {
      asyncTasks.push(
        emailService
          .sendPropertyTransactionEmail({
            to: owner.email,
            subject: `New booking for ${propertyLabel}`,
            title: 'New property booking',
            introLines: [
              `${tenantName} booked ${propertyLabel}.`,
              `Rent: ${rentLabel} (charges: ${chargesLabel}).`,
            ],
            details: [
              { label: 'Property', value: propertyLabel },
              { label: 'Reference', value: property.reference || '' },
              { label: 'Tenant', value: `${tenantName}${tenant?.email ? ` (${tenant.email})` : ''}` },
              { label: 'Rent', value: rentLabel },
              { label: 'Charges', value: chargesLabel },
              { label: 'Start date', value: startLabel },
              { label: 'End date', value: endLabel },
              { label: 'Status', value: lease.status },
            ],
            footerNote: 'Sign in to SmartProperty to confirm or reject this booking.',
          })
          .catch((error) => logSideEffectError('owner-email', error))
      );
    }
  }

  if (tenant) {
    asyncTasks.push(
      Notification.create({
        type: NotificationType.LEASE_CREATED,
        recipientId: tenant._id,
        propertyId: property._id,
        senderUserId: owner?._id,
        senderName: ownerName || 'SmartProperty',
        senderEmail: owner?.email || process.env.EMAIL_FROM || 'noreply@smartproperty.local',
        senderPhone: owner?.phone || '',
        message: `Your booking for ${propertyLabel} is recorded from ${startLabel} to ${endLabel}.`,
      }).catch((error) => logSideEffectError('tenant-notification', error))
    );

    asyncTasks.push(
      triggerOwnerNotification(String(tenant._id), {
        ...payloadBase,
        authorName: ownerName || 'SmartProperty',
        authorEmail: owner?.email,
        message: `Your booking for ${propertyLabel} is recorded.`,
      }).catch((error) => logSideEffectError('tenant-pusher', error))
    );

    if (tenant.email) {
      asyncTasks.push(
        emailService
          .sendPropertyTransactionEmail({
            to: tenant.email,
            subject: `Booking Requested for ${propertyLabel}`,
            title: 'Booking Requested',
            introLines: [
              `Your booking for ${propertyLabel} has been recorded.`,
              `Period: ${startLabel} to ${endLabel}.`,
            ],
            details: [
              { label: 'Property', value: propertyLabel },
              { label: 'Reference', value: property.reference || '' },
              { label: 'Rent', value: rentLabel },
              { label: 'Charges', value: chargesLabel },
              { label: 'Start date', value: startLabel },
              { label: 'End date', value: endLabel },
              { label: 'Status', value: lease.status },
            ],
            footerNote: 'We will notify you when the owner responds.',
          })
          .catch((error) => logSideEffectError('tenant-email', error))
      );
    }
  }

  await Promise.allSettled(asyncTasks);
}

// @desc    Get all leases
// @route   GET /api/leases
// @access  Private
exports.getAllLeases = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      propertyId,
      tenantId
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (propertyId) filter.propertyId = propertyId;
    if (tenantId) filter.tenantId = tenantId;

    const skip = (page - 1) * limit;

    const leases = await Lease.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('propertyId', 'reference title city type price')
      .populate('tenantId', 'login email firstName lastName phone');

    const count = await Lease.countDocuments(filter);

    res.status(200).json(
      apiResponse(true, 'Leases retrieved successfully', {
        leases,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get lease calendar events based on current user role
// @route   GET /api/leases/calendar
// @access  Private
exports.getLeaseCalendar = async (req, res, next) => {
  try {
    const role = String(req.user?.role || '').toUpperCase();
    const rangeStart = normalizeDate(req.query.start, new Date());
    const rangeEnd = normalizeDate(req.query.end, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));

    const filter = {
      status: { $in: CALENDAR_VISIBLE_STATUSES },
      startDate: { $lte: rangeEnd },
      endDate: { $gte: rangeStart },
    };

    if (['TENANT', 'BUYER'].includes(role)) {
      filter.tenantId = req.user._id;
    } else if (['AGENCY', 'OWNER'].includes(role)) {
      const ownedPropertyIds = await Property.find({ createdBy: req.user._id }).distinct('_id');
      if (!ownedPropertyIds.length) {
        return res.status(200).json(apiResponse(true, 'Calendar retrieved successfully', {
          roleView: role,
          range: { start: rangeStart, end: rangeEnd },
          events: [],
          metrics: { totalLeases: 0, confirmedLeases: 0, pendingLeases: 0, completedLeases: 0, tenants: 0, properties: 0 },
        }));
      }
      filter.propertyId = { $in: ownedPropertyIds };
    } // ADMIN gets global scope

    const leases = await Lease.find(filter)
      .sort({ startDate: 1 })
      .populate('propertyId', 'reference title city listingType createdBy')
      .populate('tenantId', 'firstName lastName login email phone')
      .lean();

    const events = leases.map((lease) => toCalendarEvent(lease, role));
    const metrics = {
      totalLeases: events.length,
      confirmedLeases: events.filter((e) => e.status === LeaseStatus.CONFIRMED).length,
      pendingLeases: events.filter((e) => e.status === LeaseStatus.PENDING).length,
      completedLeases: events.filter((e) => e.status === LeaseStatus.COMPLETED).length,
      tenants: new Set(events.map((e) => e.tenant.id).filter(Boolean)).size,
      properties: new Set(events.map((e) => e.property.id).filter(Boolean)).size,
    };

    return res.status(200).json(
      apiResponse(true, 'Calendar retrieved successfully', {
        roleView: role,
        range: { start: rangeStart, end: rangeEnd },
        events,
        metrics,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lease by ID
// @route   GET /api/leases/:id
// @access  Private
exports.getLeaseById = async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate('propertyId', 'reference title city type price')
      .populate('tenantId', 'login email firstName lastName phone');

    if (!lease) {
      return res.status(404).json(
        apiResponse(false, 'Lease not found')
      );
    }

    res.status(200).json(
      apiResponse(true, 'Lease retrieved successfully', lease)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Create new lease
// @route   POST /api/leases
// @access  Private
exports.createLease = async (req, res, next) => {
  try {
    const { propertyId, tenantId, startDate, endDate, rentAmount, charges, status, note } = req.body;

    // Validate required fields
    if (!propertyId || !tenantId || !startDate || !endDate || !rentAmount) {
      return res.status(400).json(
        apiResponse(false, 'Please provide all required fields: propertyId, tenantId, startDate, endDate, rentAmount')
      );
    }

    const adminish = isAdminish(req.user.role);

    // Only allow tenant to create lease for themselves (unless admin/agency)
    if (!adminish && tenantId !== req.user._id.toString()) {
      return res.status(403).json(apiResponse(false, 'You can only create a lease for yourself'));
    }

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    // Verify tenant (user) exists
    const tenant = await User.findById(tenantId);
    if (!tenant) {
      return res.status(404).json(
        apiResponse(false, 'Tenant (User) not found')
      );
    }

    const owner = property.createdBy ? await User.findById(property.createdBy) : null;

    const blockingLease = await findBlockingLeaseForTenant(propertyId, tenantId);
    if (blockingLease) {
      return res.status(409).json(
        apiResponse(
          false,
          blockingLease.status === LeaseStatus.PENDING
            ? 'You already have a pending rental request for this property. Cancel it before sending another one.'
            : 'You already have an active or upcoming rental for this property. You can request again after your rental end date has passed.'
        )
      );
    }

    const initialStatus = adminish && status && Object.values(LeaseStatus).includes(status)
      ? status
      : LeaseStatus.PENDING;

    const lease = await Lease.create({
      propertyId,
      tenantId,
      startDate,
      endDate,
      rentAmount,
      charges,
      status: initialStatus,
    });

    const transaction = await createLeaseTransaction({
      lease,
      property,
      tenantId,
      actorId: req.user._id,
    });

    lease.transactionId = transaction._id;
    await lease.save();

    const populatedLease = await Lease.findById(lease._id)
      .populate('propertyId', 'reference title city type price status')
      .populate('tenantId', 'login email firstName lastName phone')
      .populate('transactionId');

    await recalcPropertyStatus(property._id);

    await dispatchLeaseSideEffects({
      lease: populatedLease,
      property,
      tenant,
      owner,
    });

    res.status(201).json(
      apiResponse(true, 'Lease created successfully', populatedLease)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update lease
// @route   PUT /api/leases/:id
// @access  Private
exports.updateLease = async (req, res, next) => {
  try {
    const { propertyId, tenantId, startDate, endDate, rentAmount, charges, status, note } = req.body;

    let lease = await Lease.findById(req.params.id);

    if (!lease) {
      return res.status(404).json(
        apiResponse(false, 'Lease not found')
      );
    }

    const property = await Property.findById(lease.propertyId);
    const isTenant = lease.tenantId.equals(req.user._id);
    const isOwner = property?.createdBy && property.createdBy.equals(req.user._id);
    const adminish = isAdminish(req.user.role);

    if (!adminish && !isTenant && !isOwner) {
      return res.status(403).json(apiResponse(false, 'You can only update your own lease'));
    }

    // Update fields
    if (propertyId !== undefined) lease.propertyId = propertyId;
    if (tenantId !== undefined) lease.tenantId = tenantId;
    if (startDate !== undefined) lease.startDate = startDate;
    if (endDate !== undefined) lease.endDate = endDate;
    if (rentAmount !== undefined) lease.rentAmount = rentAmount;
    if (charges !== undefined) lease.charges = charges;
    if (status !== undefined) {
      if (!Object.values(LeaseStatus).includes(status)) {
        return res.status(400).json(apiResponse(false, 'Invalid lease status'));
      }

      const wantsOwnerOnly = [LeaseStatus.CONFIRMED, LeaseStatus.COMPLETED].includes(status);
      const wantsCancel = status === LeaseStatus.CANCELLED;

      if (wantsOwnerOnly && !(adminish || isOwner)) {
        return res.status(403).json(apiResponse(false, 'Only owner or admin can confirm/complete'));
      }
      if (wantsCancel && !(adminish || isOwner || isTenant)) {
        return res.status(403).json(apiResponse(false, 'Only participants or admin can cancel'));
      }

      lease.status = status;
    }

    await lease.save();

    try {
      await syncLeaseTransactionStatus({ lease, actorId: req.user._id, note });
    } catch (err) {
      return res.status(400).json(apiResponse(false, err.message || 'Unable to update transaction status'));
    }

    const populatedLease = await Lease.findById(lease._id)
      .populate('propertyId', 'reference title city type price status')
      .populate('tenantId', 'login email firstName lastName phone')
      .populate('transactionId');

    res.status(200).json(
      apiResponse(true, 'Lease updated successfully', populatedLease)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lease
// @route   DELETE /api/leases/:id
// @access  Private
exports.deleteLease = async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id);

    if (!lease) {
      return res.status(404).json(
        apiResponse(false, 'Lease not found')
      );
    }

    const property = await Property.findById(lease.propertyId);
    const isTenant = lease.tenantId.equals(req.user._id);
    const isOwner = property?.createdBy && property.createdBy.equals(req.user._id);
    const adminish = isAdminish(req.user.role);

    if (!adminish && !isTenant && !isOwner) {
      return res.status(403).json(apiResponse(false, 'You can only delete your own lease'));
    }

    if (lease.transactionId) {
      const transaction = await Transaction.findById(lease.transactionId);
      if (transaction) {
        transaction.status = TransactionStatus.CANCELLED;
        addTimelineEntry(transaction, TransactionStatus.CANCELLED, req.user._id, 'Lease deleted');
        await transaction.save();
        await recalcPropertyStatus(transaction.propertyId);
      }
    }

    await lease.deleteOne();

    res.status(200).json(
      apiResponse(true, 'Lease deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
