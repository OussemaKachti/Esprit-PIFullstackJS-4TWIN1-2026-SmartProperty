const mongoose = require('mongoose');

const LeaseStatus = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  TERMINATED: 'TERMINATED',
};

const leaseSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    rentAmount: {
      type: Number,
      required: true,
    },
    charges: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(LeaseStatus),
      default: LeaseStatus.PENDING,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  { timestamps: true }
);

const Lease = mongoose.model('Lease', leaseSchema);

module.exports = { Lease, LeaseStatus };