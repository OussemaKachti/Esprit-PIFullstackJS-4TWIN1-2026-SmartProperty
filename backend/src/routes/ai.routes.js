const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const staticUser = require('../middleware/staticUser');

// AI-powered routes
router.post('/generate-description/:id', staticUser, aiController.generateDescription); // TODO: Replace with auth.protect + auth.authorize('ADMIN', 'AGENCY')

module.exports = router;
