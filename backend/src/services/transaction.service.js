const { Transaction, TransactionStatus, TransactionType, Property, PropertyStatus } = require('../models');

const addTimelineEntry = (transaction, status, actorId, note) => {
  transaction.timeline.push({
    status,
    actorId,
    note: note || undefined,
    at: new Date(),
  });
};

const recalcPropertyStatus = async (propertyId) => {
  const property = await Property.findById(propertyId);
  if (!property) return null;

  const now = new Date();
  let nextStatus = PropertyStatus.AVAILABLE;

  const hasConfirmedSale = await Transaction.exists({
    propertyId,
    type: TransactionType.SALE,
    status: { $in: [TransactionStatus.CONFIRMED, TransactionStatus.COMPLETED] },
  });

  if (hasConfirmedSale) {
    nextStatus = PropertyStatus.SOLD;
  } else {
    const hasActiveRent = await Transaction.exists({
      propertyId,
      type: TransactionType.RENT,
      status: TransactionStatus.CONFIRMED,
      endDate: { $gte: now },
    });

    if (hasActiveRent) {
      nextStatus = PropertyStatus.RENTED;
    } else {
      const hasPending = await Transaction.exists({ propertyId, status: TransactionStatus.PENDING });
      if (hasPending) {
        nextStatus = PropertyStatus.PENDING;
      }
    }
  }

  if (property.status !== nextStatus) {
    property.status = nextStatus;
    await property.save();
  }
  return property;
};

const hasOverlappingConfirmedRent = async (transaction) => {
  if (transaction.type !== TransactionType.RENT || !transaction.startDate || !transaction.endDate) {
    return false;
  }

  return Transaction.exists({
    _id: { $ne: transaction._id },
    propertyId: transaction.propertyId,
    type: TransactionType.RENT,
    status: TransactionStatus.CONFIRMED,
    startDate: { $lte: transaction.endDate },
    endDate: { $gte: transaction.startDate },
  });
};

module.exports = {
  addTimelineEntry,
  recalcPropertyStatus,
  hasOverlappingConfirmedRent,
};
