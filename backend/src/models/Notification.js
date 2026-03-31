const mongoose = require('mongoose');

const NotificationType = {
  ENQUIRY: 'ENQUIRY',
  RENT_REQUEST: 'RENT_REQUEST',
  LEASE_CREATED: 'LEASE_CREATED',
  SALE_CREATED: 'SALE_CREATED',
};

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.ENQUIRY,
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    senderName: {
      type: String,
      trim: true,
      required: true,
    },
    senderEmail: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    senderPhone: {
      type: String,
      trim: true,
      required: false,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification, NotificationType };
