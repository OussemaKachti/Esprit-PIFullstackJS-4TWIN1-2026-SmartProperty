const express = require('express');
const router = express.Router();

const propertyRoutes = require('./property.routes');
const aiRoutes = require('./ai.routes');

// Mount routes
router.use('/properties', propertyRoutes);
router.use('/ai', aiRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SmartProperty API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
