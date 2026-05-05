const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const controller = require('../controllers/transactionController');

router.post('/', auth.protect, auth.requireApprovedForActions, controller.createTransaction);
router.get('/', auth.protect, controller.getTransactions);
router.get('/:id', auth.protect, controller.getTransactionById);
router.patch('/:id/status', auth.protect, auth.requireApprovedForActions, controller.updateTransactionStatus);

module.exports = router;
