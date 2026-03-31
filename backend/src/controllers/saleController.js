const { Sale, SaleStatus, Property, User, Notification, NotificationType, Transaction, TransactionStatus, TransactionType } = require('../models');
const isAdminish = (role) => ['ADMIN', 'AGENCY'].includes(role);

const { apiResponse } = require('../utils/apiResponse');
const emailService = require('../services/email.service');
const { triggerOwnerNotification } = require('../services/pusher.service');
const { addTimelineEntry, recalcPropertyStatus } = require('../services/transaction.service');

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
  console.error(`[sale:${context}]`, error?.message || error);
};

const mapSaleStatusToTransactionStatus = (status) => {
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

const createSaleTransaction = async ({ sale, property, buyerId, actorId, note }) => {
  const transaction = new Transaction({
    propertyId: property._id,
    ownerId: property.createdBy || null,
    partyId: buyerId,
    type: TransactionType.SALE,
    amount: sale.salePrice,
    currency: 'TND',
    status: mapSaleStatusToTransactionStatus(sale.status),
    note,
    timeline: [],
  });

  addTimelineEntry(transaction, transaction.status, actorId, note || 'Sale recorded');
  await transaction.save();
  return transaction;
};

const syncSaleTransactionStatus = async ({ sale, actorId, note }) => {
  if (!sale.transactionId) return null;
  const transaction = await Transaction.findById(sale.transactionId);
  if (!transaction) return null;

  const nextStatus = mapSaleStatusToTransactionStatus(sale.status);
  transaction.status = nextStatus;
  addTimelineEntry(transaction, nextStatus, actorId, note || `Sale set to ${nextStatus}`);
  await transaction.save();
  await recalcPropertyStatus(transaction.propertyId);
  return transaction;
};

// @desc    Confirm sale (owner/admin)
// @route   PATCH /api/sales/:id/confirm
// @access  Private
exports.confirmSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json(apiResponse(false, 'Sale not found'));
    }

    const property = await Property.findById(sale.propertyId);
    const isOwner = property && property.createdBy && property.createdBy.equals(req.user._id);
    const adminish = ['ADMIN', 'AGENCY'].includes(req.user.role);
    if (!isOwner && !adminish) {
      return res.status(403).json(apiResponse(false, 'Only owner or admin/agency can confirm')); 
    }

    sale.status = SaleStatus.COMPLETED;
    await sale.save();
    await syncSaleTransactionStatus({ sale, actorId: req.user._id, note: 'Sale confirmed' });
    if (property) {
      await recalcPropertyStatus(property._id);
    }

    const populatedSale = await Sale.findById(sale._id)
      .populate('propertyId', 'reference title city type price status')
      .populate('buyerId', 'login email firstName lastName phone')
      .populate('transactionId');

    return res.status(200).json(apiResponse(true, 'Sale confirmed', populatedSale));
  } catch (error) {
    next(error);
  }
};

async function dispatchSaleSideEffects({ sale, property, buyer, owner, note }) {
  const propertyLabel = buildPropertyLabel(property);
  const priceLabel = formatAmount(sale.salePrice);
  const dateLabel = formatDate(sale.saleDate);
  const buyerName = getDisplayName(buyer);
  const ownerName = owner ? getDisplayName(owner) : null;
  const actionUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL.replace(/\/$/, '')}/buy-details/${property._id}`
    : undefined;

  const payloadBase = {
    id: String(sale._id),
    type: NotificationType.SALE_CREATED,
    propertyId: String(property._id),
    propertyTitle: propertyLabel,
    salePrice: sale.salePrice,
    saleDate: sale.saleDate,
    status: sale.status,
    createdAt: sale.createdAt || new Date(),
  };

  const asyncTasks = [];

  if (owner) {
    asyncTasks.push(
      Notification.create({
        type: NotificationType.SALE_CREATED,
        recipientId: owner._id,
        propertyId: property._id,
        senderUserId: buyer?._id,
        senderName: buyerName,
        senderEmail: buyer?.email || process.env.EMAIL_FROM || 'noreply@smartproperty.local',
        senderPhone: buyer?.phone || '',
        message: `${buyerName} created a sale for ${propertyLabel} (${priceLabel}).`,
      }).catch((error) => logSideEffectError('owner-notification', error))
    );

    asyncTasks.push(
      triggerOwnerNotification(String(owner._id), {
        ...payloadBase,
        authorName: buyerName,
        authorEmail: buyer?.email,
        message: `${buyerName} created a sale for ${propertyLabel}.`,
      }).catch((error) => logSideEffectError('owner-pusher', error))
    );

    if (owner.email) {
      asyncTasks.push(
        emailService
          .sendPropertyTransactionEmail({
            to: owner.email,
            subject: `New sale for ${propertyLabel}`,
            title: 'New property sale',
            introLines: [
              `${buyerName} created a sale for ${propertyLabel}.`,
              `Offered price: ${priceLabel}.`,
              note ? `Note: ${note}` : null,
            ],
            details: [
              { label: 'Property', value: propertyLabel },
              { label: 'Reference', value: property.reference || '' },
              { label: 'Buyer', value: `${buyerName}${buyer?.email ? ` (${buyer.email})` : ''}` },
              { label: 'Sale price', value: priceLabel },
              { label: 'Sale date', value: dateLabel },
              { label: 'Status', value: sale.status },
              note ? { label: 'Note', value: note } : null,
            ],
            actionUrl,
            actionLabel: 'Open sale',
            footerNote: 'Sign in to SmartProperty to review this sale.',
          })
          .catch((error) => logSideEffectError('owner-email', error))
      );
    }
  }

  if (buyer) {
    asyncTasks.push(
      Notification.create({
        type: NotificationType.SALE_CREATED,
        recipientId: buyer._id,
        propertyId: property._id,
        senderUserId: owner?._id,
        senderName: ownerName || 'SmartProperty',
        senderEmail: owner?.email || process.env.EMAIL_FROM || 'noreply@smartproperty.local',
        senderPhone: owner?.phone || '',
        message: `Your sale for ${propertyLabel} has been created.`,
      }).catch((error) => logSideEffectError('buyer-notification', error))
    );

    asyncTasks.push(
      triggerOwnerNotification(String(buyer._id), {
        ...payloadBase,
        authorName: ownerName || 'SmartProperty',
        authorEmail: owner?.email,
        message: `Your sale for ${propertyLabel} is recorded.`,
      }).catch((error) => logSideEffectError('buyer-pusher', error))
    );

    if (buyer.email) {
      asyncTasks.push(
        emailService
          .sendPropertyTransactionEmail({
            to: buyer.email,
            subject: `Sale recorded for ${propertyLabel}`,
            title: 'Sale Request',
            introLines: [
              `Your sale for ${propertyLabel} has been recorded.`,
              `Price: ${priceLabel}.`,
              note ? `Note: ${note}` : null,
            ],
            details: [
              { label: 'Property', value: propertyLabel },
              { label: 'Reference', value: property.reference || '' },
              { label: 'Sale price', value: priceLabel },
              { label: 'Sale date', value: dateLabel },
              { label: 'Status', value: sale.status },
              note ? { label: 'Note', value: note } : null,
            ],
            actionUrl,
            actionLabel: 'View request',
            footerNote: 'We will notify you when the owner responds.',
          })
          .catch((error) => logSideEffectError('buyer-email', error))
      );
    }
  }

  await Promise.allSettled(asyncTasks);
}

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
exports.getAllSales = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      propertyId,
      buyerId,
      minPrice,
      maxPrice,
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (propertyId) filter.propertyId = propertyId;
    if (buyerId) filter.buyerId = buyerId;
    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = Number(minPrice);
      if (maxPrice) filter.salePrice.$lte = Number(maxPrice);
    }
    if (startDate || endDate) {
      filter.saleDate = {};
      if (startDate) filter.saleDate.$gte = new Date(startDate);
      if (endDate) filter.saleDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const sales = await Sale.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort({ saleDate: -1 })
      .populate('propertyId', 'reference title city type price')
      .populate('buyerId', 'login email firstName lastName phone');

    const count = await Sale.countDocuments(filter);

    res.status(200).json(
      apiResponse(true, 'Sales retrieved successfully', {
        sales,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale by ID
// @route   GET /api/sales/:id
// @access  Private
exports.getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('propertyId', 'reference title city type price')
      .populate('buyerId', 'login email firstName lastName phone');

    if (!sale) {
      return res.status(404).json(
        apiResponse(false, 'Sale not found')
      );
    }

    res.status(200).json(
      apiResponse(true, 'Sale retrieved successfully', sale)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
exports.createSale = async (req, res, next) => {
  try {
    const { propertyId, buyerId, salePrice, saleDate, status, price, note } = req.body;

    // Normalize inputs: accept "price" as alias, and default saleDate to now if missing
    const normalizedSalePrice = salePrice ?? price;
    const normalizedSaleDate = saleDate || new Date();
    const adminish = isAdminish(req.user.role);

    // Validate required fields
    if (!propertyId || !buyerId || normalizedSalePrice === undefined || normalizedSalePrice === null) {
      return res.status(400).json(
        apiResponse(false, 'Please provide propertyId, buyerId, and salePrice')
      );
    }

    // Only allow buyer to create sale for themselves (unless admin/agency)
    if (!adminish && buyerId !== req.user._id.toString()) {
      return res.status(403).json(
        apiResponse(false, 'You can only create a sale for yourself')
      );
    }

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    // Verify buyer (user) exists
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json(
        apiResponse(false, 'Buyer (User) not found')
      );
    }

    const owner = property.createdBy ? await User.findById(property.createdBy) : null;

    const initialStatus = adminish && status && Object.values(SaleStatus).includes(status)
      ? status
      : SaleStatus.PENDING;

    const sale = await Sale.create({
      propertyId,
      buyerId,
      salePrice: normalizedSalePrice,
      saleDate: normalizedSaleDate,
      status: initialStatus,
    });

    const transaction = await createSaleTransaction({
      sale,
      property,
      buyerId,
      actorId: req.user._id,
      note,
    });

    sale.transactionId = transaction._id;
    await sale.save();

    const populatedSale = await Sale.findById(sale._id)
      .populate('propertyId', 'reference title city type price status')
      .populate('buyerId', 'login email firstName lastName phone')
      .populate('transactionId');

    await recalcPropertyStatus(property._id);

    await dispatchSaleSideEffects({
      sale: populatedSale,
      property,
      buyer,
      owner,
      note,
    });

    res.status(201).json(
      apiResponse(true, 'Sale created successfully', populatedSale)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Private
exports.updateSale = async (req, res, next) => {
  try {
    const { propertyId, buyerId, salePrice, saleDate, status, note } = req.body;

    let sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json(
        apiResponse(false, 'Sale not found')
      );
    }

    const property = await Property.findById(sale.propertyId);
    const isBuyer = sale.buyerId.equals(req.user._id);
    const isOwner = property?.createdBy && property.createdBy.equals(req.user._id);
    const adminish = isAdminish(req.user.role);

    if (!adminish && !isBuyer && !isOwner) {
      return res.status(403).json(apiResponse(false, 'You can only update your own sale'));
    }

    // Update fields
    if (propertyId !== undefined) sale.propertyId = propertyId;
    if (buyerId !== undefined) sale.buyerId = buyerId;
    if (salePrice !== undefined) sale.salePrice = salePrice;
    if (saleDate !== undefined) sale.saleDate = saleDate;
    if (status !== undefined) {
      if (!Object.values(SaleStatus).includes(status)) {
        return res.status(400).json(apiResponse(false, 'Invalid sale status'));
      }

      const wantsOwnerOnly = [SaleStatus.CONFIRMED, SaleStatus.COMPLETED].includes(status);
      const wantsCancel = status === SaleStatus.CANCELLED;

      if (wantsOwnerOnly && !(adminish || isOwner)) {
        return res.status(403).json(apiResponse(false, 'Only owner or admin can confirm/complete'));
      }
      if (wantsCancel && !(adminish || isOwner || isBuyer)) {
        return res.status(403).json(apiResponse(false, 'Only participants or admin can cancel'));
      }

      sale.status = status;
    }

    await sale.save();

    await syncSaleTransactionStatus({ sale, actorId: req.user._id, note });

    const populatedSale = await Sale.findById(sale._id)
      .populate('propertyId', 'reference title city type price status')
      .populate('buyerId', 'login email firstName lastName phone')
      .populate('transactionId');

    res.status(200).json(
      apiResponse(true, 'Sale updated successfully', populatedSale)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Private
exports.deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json(
        apiResponse(false, 'Sale not found')
      );
    }

    const property = await Property.findById(sale.propertyId);
    const isBuyer = sale.buyerId.equals(req.user._id);
    const isOwner = property?.createdBy && property.createdBy.equals(req.user._id);
    const adminish = isAdminish(req.user.role);

    if (!adminish && !isBuyer && !isOwner) {
      return res.status(403).json(apiResponse(false, 'You can only delete your own sale'));
    }

    if (sale.transactionId) {
      const transaction = await Transaction.findById(sale.transactionId);
      if (transaction) {
        transaction.status = TransactionStatus.CANCELLED;
        addTimelineEntry(transaction, TransactionStatus.CANCELLED, req.user._id, 'Sale deleted');
        await transaction.save();
        await recalcPropertyStatus(transaction.propertyId);
      }
    }

    await sale.deleteOne();

    res.status(200).json(
      apiResponse(true, 'Sale deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
