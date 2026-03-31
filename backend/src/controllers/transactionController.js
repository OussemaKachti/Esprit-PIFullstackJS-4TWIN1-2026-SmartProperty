const { Transaction, TransactionStatus, TransactionType, Property, User } = require('../models');
const { apiResponse } = require('../utils/apiResponse');
const { addTimelineEntry, recalcPropertyStatus, hasOverlappingConfirmedRent } = require('../services/transaction.service');

const isAdminish = (role) => ['ADMIN', 'AGENCY'].includes(role);

const ensureAccess = (transaction, user, property) => {
  const ownsByLink = transaction.ownerId && transaction.ownerId.equals(user._id);
  const ownsByProperty = property?.createdBy && property.createdBy.equals(user._id);
  const isOwner = ownsByLink || ownsByProperty;
  const isParty = transaction.partyId && transaction.partyId.equals(user._id);
  const admin = isAdminish(user.role);
  return { isOwner, isParty, admin };
};

exports.createTransaction = async (req, res, next) => {
  try {
    const {
      type,
      propertyId,
      partyId,
      amount,
      currency = 'TND',
      startDate,
      endDate,
      note,
    } = req.body;

    if (!type || !Object.values(TransactionType).includes(type)) {
      return res.status(400).json(apiResponse(false, 'type must be SALE or RENT'));
    }
    if (!propertyId || amount === undefined || amount === null) {
      return res.status(400).json(apiResponse(false, 'propertyId and amount are required'));
    }

    if (type === TransactionType.RENT && (!startDate || !endDate)) {
      return res.status(400).json(apiResponse(false, 'startDate and endDate are required for rent transactions'));
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json(apiResponse(false, 'Property not found'));
    }

    const resolvedPartyId = partyId || req.user._id;
    if (!isAdminish(req.user.role) && resolvedPartyId.toString() !== req.user._id.toString()) {
      return res.status(403).json(apiResponse(false, 'You can only create transactions for yourself'));
    }

    const partyUser = await User.findById(resolvedPartyId);
    if (!partyUser) {
      return res.status(404).json(apiResponse(false, 'User not found for partyId'));
    }

    const ownerId = property.createdBy || null;

    const transaction = new Transaction({
      propertyId,
      ownerId,
      partyId: resolvedPartyId,
      type,
      amount,
      currency,
      startDate,
      endDate,
      status: TransactionStatus.PENDING,
      note,
      timeline: [],
    });

    addTimelineEntry(transaction, TransactionStatus.PENDING, req.user._id, note || 'Request created');

    await transaction.save();
    await recalcPropertyStatus(propertyId);

    const populated = await Transaction.findById(transaction._id)
      .populate('propertyId', 'reference title city listingType status price createdBy')
      .populate('ownerId', 'firstName lastName email role')
      .populate('partyId', 'firstName lastName email role');

    return res.status(201).json(apiResponse(true, 'Transaction created', populated));
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { type, status, propertyId, role } = req.query;
    const filter = {};

    if (type && Object.values(TransactionType).includes(type)) filter.type = type;
    if (status && Object.values(TransactionStatus).includes(status)) filter.status = status;
    if (propertyId) filter.propertyId = propertyId;

    const admin = isAdminish(req.user.role);
    if (!admin) {
      filter.$or = [{ ownerId: req.user._id }, { partyId: req.user._id }];
    } else if (role === 'owner') {
      filter.ownerId = req.user._id;
    } else if (role === 'party') {
      filter.partyId = req.user._id;
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .populate('propertyId', 'reference title city listingType status price createdBy')
      .populate('ownerId', 'firstName lastName email role')
      .populate('partyId', 'firstName lastName email role');

    return res.status(200).json(apiResponse(true, 'Transactions retrieved', transactions));
  } catch (error) {
    next(error);
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('propertyId', 'reference title city listingType status price createdBy')
      .populate('ownerId', 'firstName lastName email role')
      .populate('partyId', 'firstName lastName email role');

    if (!transaction) {
      return res.status(404).json(apiResponse(false, 'Transaction not found'));
    }

    const property = transaction.propertyId?._id ? transaction.propertyId : await Property.findById(transaction.propertyId);
    const { admin, isOwner, isParty } = ensureAccess(transaction, req.user, property);
    if (!admin && !isOwner && !isParty) {
      return res.status(403).json(apiResponse(false, 'Forbidden'));
    }

    return res.status(200).json(apiResponse(true, 'Transaction retrieved', transaction));
  } catch (error) {
    next(error);
  }
};

exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!status || !Object.values(TransactionStatus).includes(status)) {
      return res.status(400).json(apiResponse(false, 'Invalid status'));
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json(apiResponse(false, 'Transaction not found'));
    }

    const property = await Property.findById(transaction.propertyId);

    // Backfill ownerId if missing but property has a creator (helps legacy records)
    if (!transaction.ownerId && property?.createdBy) {
      transaction.ownerId = property.createdBy;
    }

    const { admin, isOwner, isParty } = ensureAccess(transaction, req.user, property);

    const targetStatus =
      transaction.type === TransactionType.SALE && status === TransactionStatus.CONFIRMED
        ? TransactionStatus.COMPLETED
        : status;

    if ([TransactionStatus.CONFIRMED, TransactionStatus.COMPLETED].includes(targetStatus)) {
      if (!admin && !isOwner) {
        return res.status(403).json(apiResponse(false, 'Only owner or admin can confirm/complete'));
      }
    } else if (targetStatus === TransactionStatus.CANCELLED) {
      if (!admin && !isOwner && !isParty) {
        return res.status(403).json(apiResponse(false, 'Only participants or admin can cancel'));
      }
    }

    const previousStatus = transaction.status;
    transaction.status = targetStatus;
    const effectiveNote =
      note ||
      (transaction.type === TransactionType.SALE && status === TransactionStatus.CONFIRMED
        ? 'Sale confirmed → auto-completed'
        : undefined);
    addTimelineEntry(transaction, targetStatus, req.user._id, effectiveNote);

    if (transaction.type === TransactionType.RENT && targetStatus === TransactionStatus.CONFIRMED) {
      const overlap = await hasOverlappingConfirmedRent(transaction);
      if (overlap) {
        return res.status(400).json(apiResponse(false, 'This rental period overlaps an existing confirmed rental'));
      }
    }

    await transaction.save();
    await recalcPropertyStatus(transaction.propertyId);

    const populated = await Transaction.findById(transaction._id)
      .populate('propertyId', 'reference title city listingType status price createdBy')
      .populate('ownerId', 'firstName lastName email role')
      .populate('partyId', 'firstName lastName email role');

    return res.status(200).json(
      apiResponse(true, 'Transaction status updated', {
        transaction: populated,
        previousStatus,
      })
    );
  } catch (error) {
    next(error);
  }
};
