const { apiResponse } = require('../utils/apiResponse');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json(
      apiResponse(false, 'Validation error', { errors })
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json(
      apiResponse(false, `${field} already exists`)
    );
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json(
      apiResponse(false, 'Invalid ID format')
    );
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(
        apiResponse(false, 'File size exceeds limit (10MB)')
      );
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json(
        apiResponse(false, 'Too many files (max 20)')
      );
    }
    return res.status(400).json(
      apiResponse(false, `Upload error: ${err.message}`)
    );
  }

  // JWT errors (for Phase 2)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      apiResponse(false, 'Invalid token')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      apiResponse(false, 'Token expired')
    );
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json(
    apiResponse(false, message, {
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    })
  );
};

module.exports = errorHandler;
