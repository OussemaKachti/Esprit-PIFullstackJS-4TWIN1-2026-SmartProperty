const express = require('express');
const router = express.Router();
const { uploadImages } = require('../middleware/upload.middleware');

/**
 * @route   POST /api/upload/test
 * @desc    Simple endpoint to test image uploads - just upload files!
 * @access  Public (for testing)
 */
router.post('/test', uploadImages, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    // Return info about uploaded files
    const uploadedFiles = req.files.map(file => ({
      fieldName: file.fieldname,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    }));

    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${req.files.length} file(s)`,
      files: uploadedFiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
});

module.exports = router;
