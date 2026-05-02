const express = require('express');
const router = express.Router();
const easyWalletController = require('../controllers/easyWalletController');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/pay', easyWalletController.initiatePayment);
router.post('/create', easyWalletController.createWalletAndLink);
router.get('/status/:id', easyWalletController.getPaymentStatus);
router.get('/balance', easyWalletController.getBalance);

module.exports = router;
