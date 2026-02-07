const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { uploadImages } = require('../middleware/upload.middleware');
const { validateProperty, validatePropertyUpdate } = require('../middleware/validator');
const staticUser = require('../middleware/staticUser'); // User statique pour tests

// Property CRUD routes
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);
router.post(
  '/',
  staticUser, // User statique pour tests
  uploadImages,
  validateProperty,
  propertyController.createProperty
);
router.put(
  '/:id',
  staticUser, // User statique pour tests
  uploadImages,
  validatePropertyUpdate,
  propertyController.updateProperty
);
router.delete('/:id', staticUser, propertyController.deleteProperty);

// Image management
router.delete('/:id/images/:imageId', propertyController.deletePropertyImage);

module.exports = router;
