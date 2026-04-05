const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const controller = require('../controllers/transactionController');

router.post('/', auth.protect, controller.createTransaction);
router.get('/', auth.protect, controller.getTransactions);
router.get('/:id', auth.protect, controller.getTransactionById);
router.patch('/:id/status', auth.protect, controller.updateTransactionStatus);

module.exports = router;
