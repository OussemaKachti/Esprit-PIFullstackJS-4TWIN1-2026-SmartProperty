const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth.middleware');
const { optionalRegistrationUpload, optionalAvatarUpload } = require('../middleware/uploadUser.middleware');
const { UserRole } = require('../models/User');

router.post('/register', optionalRegistrationUpload, userController.register);

// Public: list agencies (OWNER / AGENCY role users)
router.get('/agencies', userController.getAgencies);
router.get('/agency-filters', userController.getAgencyFilters);

router.post('/login', userController.login);

router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);
router.post('/verify-reset-token/:token', userController.verifyResetToken);

router.post('/2fa/setup', protect, userController.setup2FA);
router.post('/2fa/verify', protect, userController.verify2FA);
router.post('/2fa/disable', protect, userController.disable2FA);
router.post('/2fa/validate', userController.validate2FAToken);

// Logout (optional: call before clearing token on client)
router.post('/logout', protect, userController.logout);

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

// Update current user profile
router.put(
  '/profile',
  protect,
  authorize(
    UserRole.ADMIN,
    UserRole.AGENCY,
    UserRole.OWNER,
    UserRole.TENANT,
    UserRole.BUYER
  ),
  optionalAvatarUpload,
  userController.updateProfile
);

router.get(
  '/me/offers',
  protect,
  authorize(UserRole.BUYER, UserRole.TENANT),
  userController.getMyOffers
);

router.post('/complete-onboarding', protect, userController.completeOnboarding);

// Admin routes
router.get(
  '/admin/verification-requests',
  protect,
  authorize(UserRole.ADMIN),
  userController.listVerificationRequests
);
router.patch(
  '/admin/verification-requests/:userId',
  protect,
  authorize(UserRole.ADMIN),
  userController.updateVerificationStatus
);

router.get('/all', protect, authorize(UserRole.ADMIN), userController.getAllUsers);
router.patch('/:id', protect, authorize(UserRole.ADMIN), optionalAvatarUpload, userController.updateUser);
router.delete('/:id', protect, authorize(UserRole.ADMIN), userController.deleteUser);

module.exports = router;