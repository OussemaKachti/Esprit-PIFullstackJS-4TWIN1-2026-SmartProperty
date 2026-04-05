const { Feedback } = require('../models');
const { apiResponse } = require('../utils/apiResponse');

// @desc    Get all feedbacks
// @route   GET /api/feedbacks
// @access  Public
exports.getAllFeedbacks = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      propertyId,
      agentId,
      authorId,
      minRating,
      maxRating,
      complaintCategory
    } = req.query;

    // Build filter object
    const filter = {};
    if (propertyId) filter.propertyId = propertyId;
    if (agentId) filter.agentId = agentId;
    if (authorId) filter.authorId = authorId;
    if (complaintCategory) filter.complaintCategory = complaintCategory;
    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = Number(minRating);
      if (maxRating) filter.rating.$lte = Number(maxRating);
    }

    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate('propertyId', 'reference title city type')
      .populate('agentId', 'login email firstName lastName')
      .populate('authorId', 'login email firstName lastName');

    const count = await Feedback.countDocuments(filter);

    res.status(200).json(
      apiResponse(true, 'Feedbacks retrieved successfully', {
        feedbacks,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get rating summary by property
// @route   GET /api/feedbacks/summary
// @access  Public
exports.getFeedbackSummary = async (req, res, next) => {
  try {
    const { propertyId, propertyIds } = req.query;

    let ids = [];
    if (propertyId) ids.push(propertyId);
    if (propertyIds) {
      ids = ids.concat(
        String(propertyIds)
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      );
    }
    ids = [...new Set(ids)];

    const match = {};
    if (ids.length > 0) {
      match.propertyId = { $in: ids };
    }

    const summary = await Feedback.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$propertyId',
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    const byProperty = {};
    summary.forEach((item) => {
      byProperty[String(item._id)] = {
        totalReviews: item.totalReviews || 0,
        averageRating: Number(item.averageRating || 0).toFixed(1),
      };
    });

    res.status(200).json(
      apiResponse(true, 'Feedback summary retrieved successfully', {
        byProperty,
      })
    );
  } catch (error) {
    next(error);
  }
};


// @desc    Get single feedback by ID
// @route   GET /api/feedbacks/:id
// @access  Public
exports.getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('propertyId', 'reference title city type')
      .populate('agentId', 'login email firstName lastName')
      .populate('authorId', 'login email firstName lastName');

    if (!feedback) {
      return res.status(404).json(
        apiResponse(false, 'Feedback not found')
      );
    }

    res.status(200).json(
      apiResponse(true, 'Feedback retrieved successfully', feedback)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Create new feedback
// @route   POST /api/feedbacks
// @access  Private
exports.createFeedback = async (req, res, next) => {
  try {
    const { propertyId, agentId, authorId, rating, comment, complaintCategory } = req.body;
    const authorToSave = req.user?._id || authorId;

    // Validate required fields
    if (!propertyId || !authorToSave || !rating) {
      return res.status(400).json(
        apiResponse(false, 'Please provide all required fields: propertyId, authorId, rating')
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json(
        apiResponse(false, 'Rating must be between 1 and 5')
      );
    }

    const feedback = await Feedback.create({
      propertyId,
      agentId,
      authorId: authorToSave,
      rating,
      comment,
      complaintCategory,
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('propertyId', 'reference title city type')
      .populate('agentId', 'login email firstName lastName')
      .populate('authorId', 'login email firstName lastName');

    res.status(201).json(
      apiResponse(true, 'Feedback created successfully', populatedFeedback)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update feedback
// @route   PUT /api/feedbacks/:id
// @access  Private
exports.updateFeedback = async (req, res, next) => {
  try {
    const { propertyId, agentId, authorId, rating, comment, complaintCategory } = req.body;

    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json(
        apiResponse(false, 'Feedback not found')
      );
    }

    // Check if user is author or admin
    const isAuthor = feedback.authorId.equals(req.user._id);
    if (req.user.role !== 'ADMIN' && !isAuthor) {
      return res.status(403).json(
        apiResponse(false, 'You can only update your own feedback')
      );
    }

    // Validate rating range if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json(
        apiResponse(false, 'Rating must be between 1 and 5')
      );
    }

    // Update fields
    if (propertyId !== undefined) feedback.propertyId = propertyId;
    if (agentId !== undefined) feedback.agentId = agentId;
    if (authorId !== undefined) feedback.authorId = authorId;
    if (rating !== undefined) feedback.rating = rating;
    if (comment !== undefined) feedback.comment = comment;
    if (complaintCategory !== undefined) feedback.complaintCategory = complaintCategory;

    await feedback.save();

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('propertyId', 'reference title city type')
      .populate('agentId', 'login email firstName lastName')
      .populate('authorId', 'login email firstName lastName');

    res.status(200).json(
      apiResponse(true, 'Feedback updated successfully', populatedFeedback)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedbacks/:id
// @access  Private
exports.deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json(
        apiResponse(false, 'Feedback not found')
      );
    }

    // Check if user is author or admin
    const isAuthor = feedback.authorId.equals(req.user._id);
    if (req.user.role !== 'ADMIN' && !isAuthor) {
      return res.status(403).json(
        apiResponse(false, 'You can only delete your own feedback')
      );
    }

    await feedback.deleteOne();

    res.status(200).json(
      apiResponse(true, 'Feedback deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
