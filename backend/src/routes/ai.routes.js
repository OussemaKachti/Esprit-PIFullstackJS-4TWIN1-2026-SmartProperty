const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth.middleware');

// AI-powered routes
router.post('/generate-description/:id', auth.protect, auth.authorize('ADMIN', 'AGENCY', 'OWNER'), aiController.generateDescription);

module.exports = router;
