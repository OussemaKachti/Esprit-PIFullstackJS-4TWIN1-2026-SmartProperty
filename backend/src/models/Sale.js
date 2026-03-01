const mongoose = require('mongoose');

const SaleStatus = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
};

const saleSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    saleDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SaleStatus),
      default: SaleStatus.PENDING,
    },
  },
  { timestamps: true }
);

const Sale = mongoose.model('Sale', saleSchema);

module.exports = { Sale, SaleStatus };