const express = require('express');
const router = express.Router();
const rentPaymentController = require('../controllers/rentPaymentController');
const auth = require('../middleware/auth.middleware');

// Rent Payment CRUD routes
router.get('/', auth.protect, rentPaymentController.getAllRentPayments);
router.get('/:id', auth.protect, rentPaymentController.getRentPaymentById);
router.post(
  '/',
  auth.protect,
  rentPaymentController.createRentPayment
);
router.put(
  '/:id',
  auth.protect,
  rentPaymentController.updateRentPayment
);
router.delete(
  '/:id',
  auth.protect,
  rentPaymentController.deleteRentPayment
);

module.exports = router;
