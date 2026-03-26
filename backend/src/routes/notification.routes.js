const express = require('express');

const auth = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.post('/enquiry', notificationController.createEnquiryNotification);
router.get('/owner', auth.protect, notificationController.getOwnerNotifications);

module.exports = router;
