const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth.middleware');

// AI-powered routes
router.post(
  '/generate-description/:id',
  auth.protect,
  auth.authorize('ADMIN', 'AGENCY', 'OWNER'),
  aiController.generateDescription
);

router.post(
  '/generate-description-preview',
  auth.protect,
  auth.authorize('ADMIN', 'AGENCY', 'OWNER'),
  aiController.generateDescriptionPreview
);

// Alias for frontend compatibility
router.post(
  '/generate-description-draft',
  auth.protect,
  auth.authorize('ADMIN', 'AGENCY', 'OWNER'),
  aiController.generateDescriptionPreview
);

module.exports = router;
