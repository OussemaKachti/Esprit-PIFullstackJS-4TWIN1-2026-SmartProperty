const express = require('express');
const router = express.Router();
const leaseController = require('../controllers/leaseController');
const auth = require('../middleware/auth.middleware');

// Lease CRUD routes
router.get('/', auth.protect, leaseController.getAllLeases);
router.get('/:id', auth.protect, leaseController.getLeaseById);
router.post(
  '/',
  auth.protect,
  leaseController.createLease
);
router.put(
  '/:id',
  auth.protect,
  auth.authorize('ADMIN', 'AGENCY', 'OWNER'),
  leaseController.updateLease
);
router.delete(
  '/:id',
  auth.protect,
  leaseController.deleteLease
);

module.exports = router;
