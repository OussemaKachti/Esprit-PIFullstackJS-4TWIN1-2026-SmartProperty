const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth.middleware');
const { UserRole } = require('../models/User');

// Registration route
router.post('/register', userController.register);

// Login route
router.post('/login', userController.login);

// Forgot password routes
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);
router.post('/verify-reset-token/:token', userController.verifyResetToken);

// 2FA routes
router.post('/2fa/setup', protect, userController.setup2FA);
router.post('/2fa/verify', protect, userController.verify2FA);
router.post('/2fa/disable', protect, userController.disable2FA);
router.post('/2fa/validate', userController.validate2FAToken);

// Get current user profile
router.get(
  '/profile',
  protect,
  authorize(
    UserRole.ADMIN,
    UserRole.AGENCY,
    UserRole.OWNER,
    UserRole.TENANT,
    UserRole.BUYER
  ),
  userController.getProfile
);

module.exports = router;