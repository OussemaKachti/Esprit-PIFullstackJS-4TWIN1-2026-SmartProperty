const express = require('express');
const router = express.Router();


const propertyRoutes = require('./property.routes');
const aiRoutes = require('./ai.routes');
const userRoutes = require('./user.routes');
const uploadRoutes = require('./upload.routes');
const leaseRoutes = require('./lease.routes');
const rentPaymentRoutes = require('./rentPayment.routes');
const feedbackRoutes = require('./feedback.routes');
const saleRoutes = require('./sale.routes');
const transactionRoutes = require('./transaction.routes');
const pusherRoutes = require('./pusher.routes');
const notificationRoutes = require('./notification.routes');
const biRoutes = require('./bi.routes');


// Mount routes
router.use('/properties', propertyRoutes);
router.use('/ai', aiRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/leases', leaseRoutes);
router.use('/rent-payments', rentPaymentRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/sales', saleRoutes);
router.use('/transactions', transactionRoutes);
router.use('/pusher', pusherRoutes);
router.use('/notifications', notificationRoutes);
router.use('/bi', biRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SmartProperty API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
