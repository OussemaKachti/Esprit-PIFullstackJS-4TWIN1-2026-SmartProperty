const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { uploadImages } = require('../middleware/upload.middleware');
const { validateProperty, validatePropertyUpdate } = require('../middleware/validator');
const auth = require('../middleware/auth.middleware');

// Property CRUD routes (specific routes before /:id)
router.get('/', propertyController.getAllProperties);
router.get('/my', auth.protect, propertyController.getMyProperties);
router.get('/user/:userId', propertyController.getPropertiesByUser);
router.get('/:id', propertyController.getPropertyById);
router.post(
  '/',
  auth.protect,
  auth.authorize('ADMIN', 'AGENCY', 'OWNER'),
  uploadImages,
  validateProperty,
  propertyController.createProperty
);
router.put(
  '/:id',
  auth.protect,
  auth.authorize('ADMIN', 'AGENCY', 'OWNER'),
  uploadImages,
  validatePropertyUpdate,
  propertyController.updateProperty
);
router.delete('/:id', auth.protect, auth.authorize('ADMIN'), propertyController.deleteProperty);

// Image management (protected)
router.delete('/:id/images/:imageId', auth.protect, auth.authorize('ADMIN', 'AGENCY', 'OWNER'), propertyController.deletePropertyImage);

module.exports = router;
