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
