const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const auth = require('../middleware/auth.middleware');

// Sale CRUD routes
router.get('/', auth.protect, saleController.getAllSales);
router.get('/:id', auth.protect, saleController.getSaleById);
router.post(
  '/',
  auth.protect,
  auth.requireApprovedForActions,
  saleController.createSale
);
router.put(
  '/:id',
  auth.protect,
  auth.requireApprovedForActions,
  saleController.updateSale
);
router.patch(
  '/:id/confirm',
  auth.protect,
  auth.requireApprovedForActions,
  saleController.confirmSale
);
router.delete(
  '/:id',
  auth.protect,
  auth.requireApprovedForActions,
  saleController.deleteSale
);

module.exports = router;
