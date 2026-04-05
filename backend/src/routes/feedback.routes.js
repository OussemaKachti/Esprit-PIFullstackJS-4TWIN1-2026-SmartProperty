const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/auth.middleware');

// Feedback CRUD routes
router.get('/', feedbackController.getAllFeedbacks);
router.get('/summary', feedbackController.getFeedbackSummary);
router.get('/:id', feedbackController.getFeedbackById);
router.post(
  '/',
  auth.protect,
  feedbackController.createFeedback
);
router.put(
  '/:id',
  auth.protect,
  feedbackController.updateFeedback
);
router.delete(
  '/:id',
  auth.protect,
  feedbackController.deleteFeedback
);

module.exports = router;
