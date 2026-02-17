const mongoose = require('mongoose');

const ComplaintCategory = {
  PROPERTY_CONDITION: 'PROPERTY_CONDITION',
  AGENT_BEHAVIOR: 'AGENT_BEHAVIOR',
  BILLING: 'BILLING',
};

const feedbackSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    complaintCategory: {
      type: String,
      enum: Object.values(ComplaintCategory),
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = { Feedback, ComplaintCategory };