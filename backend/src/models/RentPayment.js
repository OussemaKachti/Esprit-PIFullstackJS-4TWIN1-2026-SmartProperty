const mongoose = require('mongoose');

const PaymentStatus = {
  PAID: 'PAID',
  UNPAID: 'UNPAID',
};

const rentPaymentSchema = new mongoose.Schema(
  {
    leaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lease',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNPAID,
    },
  },
  { timestamps: true }
);

const RentPayment = mongoose.model('RentPayment', rentPaymentSchema);

module.exports = { RentPayment, PaymentStatus };