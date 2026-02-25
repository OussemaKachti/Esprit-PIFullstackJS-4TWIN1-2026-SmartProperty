const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth.middleware');
const { UserRole } = require('../models/User');

router.post('/register', userController.register);

router.post('/login', userController.login);

router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);
router.post('/verify-reset-token/:token', userController.verifyResetToken);

router.post('/2fa/setup', protect, userController.setup2FA);
router.post('/2fa/verify', protect, userController.verify2FA);
router.post('/2fa/disable', protect, userController.disable2FA);
router.post('/2fa/validate', userController.validate2FAToken);

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
  (req, res) => {
    res.json({ message: 'Profile fetched successfully', user: req.user });
  }
);

router.post('/complete-onboarding', protect, userController.completeOnboarding);

module.exports = router;