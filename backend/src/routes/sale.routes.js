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
  saleController.createSale
);
router.put(
  '/:id',
  auth.protect,
  saleController.updateSale
);
router.delete(
  '/:id',
  auth.protect,
  saleController.deleteSale
);

module.exports = router;
