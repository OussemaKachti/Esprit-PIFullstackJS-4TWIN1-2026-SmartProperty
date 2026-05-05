const express = require('express');
const router = express.Router();
const leaseController = require('../controllers/leaseController');
const auth = require('../middleware/auth.middleware');

// Lease CRUD routes
router.get('/', auth.protect, leaseController.getAllLeases);
router.get('/calendar', auth.protect, leaseController.getLeaseCalendar);
router.get('/:id', auth.protect, leaseController.getLeaseById);
router.post(
  '/',
  auth.protect,
  auth.requireApprovedForActions,
  leaseController.createLease
);
router.patch(
  '/:id/confirm',
  auth.protect,
  auth.requireApprovedForActions,
  leaseController.confirmLease
);
router.put(
  '/:id',
  auth.protect,
  auth.requireApprovedForActions,
  auth.authorize('ADMIN', 'AGENCY', 'OWNER'),
  leaseController.updateLease
);
router.delete(
  '/:id',
  auth.protect,
  auth.requireApprovedForActions,
  leaseController.deleteLease
);

module.exports = router;
