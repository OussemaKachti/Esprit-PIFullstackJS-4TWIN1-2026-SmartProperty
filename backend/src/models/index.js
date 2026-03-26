const { Property, PropertyType, PropertyStatus, ListingType } = require('./Property');
const { User, UserRole } = require('./User');
const { Lease, LeaseStatus } = require('./Lease');
const { RentPayment, PaymentStatus } = require('./RentPayment');
const { Feedback, ComplaintCategory } = require('./FeedBack');
const { Sale, SaleStatus } = require('./Sale');
const { Notification, NotificationType } = require('./Notification');

module.exports = {
  Property,
  PropertyType,
  PropertyStatus,
  ListingType,
  User,
  UserRole,
  Lease,
  LeaseStatus,
  RentPayment,
  PaymentStatus,
  Feedback,
  ComplaintCategory,
  Sale,
  SaleStatus,
  Notification,
  NotificationType,
};
