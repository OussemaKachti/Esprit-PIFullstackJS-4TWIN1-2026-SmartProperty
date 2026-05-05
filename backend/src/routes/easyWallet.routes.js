const express = require('express');
const router = express.Router();
const easyWalletController = require('../controllers/easyWalletController');
const { protect, requireApprovedForActions } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/pay', requireApprovedForActions, easyWalletController.initiatePayment);
router.post('/create', requireApprovedForActions, easyWalletController.createWalletAndLink);
router.get('/status/:id', easyWalletController.getPaymentStatus);
router.get('/balance', easyWalletController.getBalance);

module.exports = router;
