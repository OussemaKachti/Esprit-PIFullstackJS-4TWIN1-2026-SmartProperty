const mongoose = require('mongoose');

const TransactionType = {
  SALE: 'SALE',
  RENT: 'RENT',
};

const TransactionStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

const timelineEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'TND',
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    note: {
      type: String,
      trim: true,
    },
    timeline: [timelineEntrySchema],
  },
  { timestamps: true }
);

transactionSchema.index({ propertyId: 1, type: 1, status: 1, startDate: 1, endDate: 1 });
transactionSchema.index({ ownerId: 1 });
transactionSchema.index({ partyId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction, TransactionType, TransactionStatus };
