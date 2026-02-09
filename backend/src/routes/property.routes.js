const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { uploadImages } = require('../middleware/upload.middleware');
const { validateProperty, validatePropertyUpdate } = require('../middleware/validator');
const staticUser = require('../middleware/staticUser');

// Property CRUD routes
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);
router.post(
  '/',
  staticUser, // TODO: Replace with auth.protect + auth.authorize('ADMIN', 'AGENCY')
  uploadImages,
  validateProperty,
  propertyController.createProperty
);
router.put(
  '/:id',
  staticUser, // TODO: Replace with auth.protect + auth.authorize('ADMIN', 'AGENCY')
  uploadImages,
  validatePropertyUpdate,
  propertyController.updateProperty
);
router.delete('/:id', staticUser, propertyController.deleteProperty); // TODO: Replace with auth.protect + auth.authorize('ADMIN')

// Image management
router.delete('/:id/images/:imageId', propertyController.deletePropertyImage);

module.exports = router;
