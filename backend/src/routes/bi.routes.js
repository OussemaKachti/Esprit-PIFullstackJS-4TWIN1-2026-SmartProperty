const express = require('express');
const router = express.Router();
const biController = require('../controllers/biController');
const { protect, authorize } = require('../middleware/auth.middleware');

// GET /api/bi/analytics — Admin only BI dashboard data
router.get('/analytics', protect, authorize('ADMIN'), biController.getAnalytics);

module.exports = router;
