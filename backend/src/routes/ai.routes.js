const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const staticUser = require('../middleware/staticUser'); // User statique pour tests

// AI-powered routes
router.post('/generate-description/:id', staticUser, aiController.generateDescription);

// Routes d'analyse d'images - Désactivées pour Phase 1 (focus sur CRUD + descriptions)
// router.post('/analyze-images/:id', staticUser, aiController.analyzeImages);
// router.post('/apply-features/:id', staticUser, aiController.applyDetectedFeatures);

module.exports = router;
