const { Notification, NotificationType, Property } = require('../models');
const { apiResponse } = require('../utils/apiResponse');
const { triggerOwnerNotification } = require('../services/pusher.service');

// @desc    Submit enquiry/rent request notification to property owner
// @route   POST /api/notifications/enquiry
// @access  Public
exports.createEnquiryNotification = async (req, res, next) => {
  try {
    const {
      propertyId,
      senderName,
      senderEmail,
      senderPhone,
      message,
      type,
    } = req.body || {};

    if (!propertyId || !senderName || !senderEmail || !message) {
      return res.status(400).json(
        apiResponse(false, 'propertyId, senderName, senderEmail and message are required')
      );
    }

    const property = await Property.findById(propertyId)
      .select('title reference createdBy listingType')
      .lean();

    if (!property) {
      return res.status(404).json(apiResponse(false, 'Property not found'));
    }

    if (!property.createdBy) {
      return res.status(400).json(apiResponse(false, 'This property has no owner assigned'));
    }

    const finalType =
      type && Object.values(NotificationType).includes(type)
        ? type
        : property.listingType === 'FOR_RENT'
          ? NotificationType.RENT_REQUEST
          : NotificationType.ENQUIRY;

    const notification = await Notification.create({
      type: finalType,
      recipientId: property.createdBy,
      propertyId,
      senderName: String(senderName).trim(),
      senderEmail: String(senderEmail).trim().toLowerCase(),
      senderPhone: senderPhone ? String(senderPhone).trim() : '',
      message: String(message).trim(),
    });

    const payload = {
      id: String(notification._id),
      type: notification.type,
      propertyId: String(propertyId),
      propertyTitle: property.title || property.reference || 'your property',
      authorName: notification.senderName,
      authorEmail: notification.senderEmail,
      message: notification.message,
      createdAt: notification.createdAt,
    };

    try {
      await triggerOwnerNotification(String(property.createdBy), payload, 'notification.created');
    } catch (pushError) {
      console.error('Failed to push owner notification:', pushError.message);
    }

    return res.status(201).json(
      apiResponse(true, 'Notification sent successfully', {
        notificationId: String(notification._id),
      })
    );
  } catch (error) {
    return next(error);
  }
};

// @desc    Get notifications for current owner
// @route   GET /api/notifications/owner
// @access  Private
exports.getOwnerNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('propertyId', 'title reference')
      .lean();

    const mapped = notifications.map((item) => {
      const property = item.propertyId || {};
      return {
        id: String(item._id),
        type: item.type,
        propertyId: property._id ? String(property._id) : String(item.propertyId),
        propertyTitle: property.title || property.reference || 'your property',
        authorName: item.senderName,
        authorEmail: item.senderEmail || null,
        message: item.message,
        createdAt: item.createdAt,
      };
    });

    return res.status(200).json(
      apiResponse(true, 'Notifications retrieved successfully', {
        notifications: mapped,
      })
    );
  } catch (error) {
    return next(error);
  }
};

// @desc    Get platform notifications for admin dashboard
// @route   GET /api/notifications/admin
// @access  Private (Admin)
exports.getAdminNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const page = Math.max(1, Number(req.query.page) || 1);
    const skip = (page - 1) * limit;

    const total = await Notification.countDocuments({});

    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('recipientId', 'firstName lastName login email role')
      .populate('propertyId', 'title reference city type listingType status price')
      .lean();

    const unread = await Notification.countDocuments({ isRead: false });

    const mapped = notifications.map((item) => {
      const property = item.propertyId || {};
      const recipient = item.recipientId || {};

      return {
        id: String(item._id),
        type: item.type,
        isRead: Boolean(item.isRead),
        propertyId: property._id ? String(property._id) : String(item.propertyId),
        propertyTitle: property.title || property.reference || 'Property',
        propertyCity: property.city || '',
        propertyStatus: property.status || '',
        recipientName: [recipient.firstName, recipient.lastName].filter(Boolean).join(' ') || recipient.login || recipient.email || 'User',
        recipientRole: recipient.role || '',
        authorName: item.senderName,
        authorEmail: item.senderEmail || null,
        message: item.message,
        createdAt: item.createdAt,
      };
    });

    return res.status(200).json(
      apiResponse(true, 'Admin notifications retrieved successfully', {
        notifications: mapped,
        total,
        unread,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    );
  } catch (error) {
    return next(error);
  }
};
