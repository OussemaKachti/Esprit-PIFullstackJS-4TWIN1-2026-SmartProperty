const { Property } = require('../models');
const { apiResponse } = require('../utils/apiResponse');
const descriptionService = require('../services/description.service');

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

    // Generate 3 description variants
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

// @desc    Generate AI description from draft property (no saved property yet)
// @route   POST /api/ai/generate-description-draft
// @access  Public (for multi-step form)
exports.generateDescriptionFromDraft = async (req, res, next) => {
  try {
    const { property: draft, tone = 'professional', length = 'medium' } = req.body;

    if (!draft || typeof draft !== 'object') {
      return res.status(400).json(
        apiResponse(false, 'property object is required')
      );
    }

    const propertyLike = {
      type: draft.type || 'apartment',
      surface: Number(draft.surface) || 0,
      rooms: Number(draft.rooms) || 0,
      address: draft.address || '',
      city: draft.city || '',
      price: Number(draft.price) || 0,
      detectedFeatures: null,
    };

    const descriptions = await descriptionService.generateDescriptions(
      propertyLike,
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
