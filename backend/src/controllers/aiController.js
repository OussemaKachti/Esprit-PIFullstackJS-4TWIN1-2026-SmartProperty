const { Property } = require('../models');
const { apiResponse } = require('../utils/apiResponse');
const descriptionService = require('../services/description.service');
const imageAnalysisService = require('../services/imageAnalysis.service');

// @desc    Generate AI description for property
// @route   POST /api/ai/generate-description/:id
// @access  Private (Admin/Agent)
exports.generateDescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tone = 'professional', length = 'medium' } = req.body;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    // Generate 3 description variants (temporairement désactivé IA)
    const descriptions = await descriptionService.generateDescriptions(
      property,
      tone,
      length
    );

    res.status(200).json(
      apiResponse(true, 'Descriptions generated successfully', descriptions)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Detect property features from images
// @route   POST /api/ai/analyze-images/:id
// @access  Private (Admin/Agent)
exports.analyzeImages = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    if (!property.images || property.images.length === 0) {
      return res.status(400).json(
        apiResponse(false, 'No images found for this property')
      );
    }

    // Analyze images with GPT-4 Vision (temporairement désactivé)
    const detectedFeatures = await imageAnalysisService.analyzePropertyImages(
      property.images.map(img => img.url)
    );

    // Update property with detected features
    property.detectedFeatures = detectedFeatures;
    await property.save();

    res.status(200).json(
      apiResponse(true, 'Images analyzed successfully', detectedFeatures)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Apply AI-detected features to property
// @route   POST /api/ai/apply-features/:id
// @access  Private (Admin/Agent)
exports.applyDetectedFeatures = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { features } = req.body;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json(
        apiResponse(false, 'Property not found')
      );
    }

    // Apply selected features to property (temporairement désactivé)
    if (features.rooms) property.rooms = features.rooms;
    if (features.surface) property.surface = features.surface;
    if (features.type) property.type = features.type;

    property.detectedFeatures = features;
    await property.save();

    res.status(200).json(
      apiResponse(true, 'Features applied successfully', property)
    );
  } catch (error) {
    next(error);
  }
};
