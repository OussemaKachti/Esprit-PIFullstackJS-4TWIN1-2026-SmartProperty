const Joi = require('joi');
const { PropertyType, PropertyStatus } = require('../models');
const { apiResponse } = require('../utils/apiResponse');

/**
 * Validation middleware using Joi
 */

// Property validation schema
const propertySchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(5000).allow(''),
  type: Joi.string()
    .valid(...Object.values(PropertyType))
    .required(),
  status: Joi.string()
    .valid(...Object.values(PropertyStatus))
    .optional(),
  price: Joi.number().min(0).required(),
  surface: Joi.number().min(0).required(),
  rooms: Joi.number().integer().min(0).required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().required(),
  location: Joi.object({
    type: Joi.string().valid('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2),
  }).optional(),
});

// Property update schema (all fields optional)
const propertyUpdateSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().max(5000).allow('').optional(),
  type: Joi.string()
    .valid(...Object.values(PropertyType))
    .optional(),
  status: Joi.string()
    .valid(...Object.values(PropertyStatus))
    .optional(),
  price: Joi.number().min(0).optional(),
  surface: Joi.number().min(0).optional(),
  rooms: Joi.number().integer().min(0).optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  country: Joi.string().optional(),
  location: Joi.object({
    type: Joi.string().valid('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2),
  }).optional(),
  aiGeneratedDescription: Joi.boolean().optional(),
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json(
        apiResponse(false, 'Validation error', { errors })
      );
    }

    req.body = value; // Use validated and sanitized data
    next();
  };
};

// Export validation middleware
exports.validateProperty = validate(propertySchema);
exports.validatePropertyUpdate = validate(propertyUpdateSchema);
