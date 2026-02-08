const express = require('express');
const { rewriteTextWithTone } = require('../services/gpt/gptService');
const validateToneChangerRequest = require('../middleware/validateRequest');

const router = express.Router();

router.post('/', validateToneChangerRequest, async (req, res) => {
  const { text, tone } = req.body;

  try {
    const rewrittenText = await rewriteTextWithTone(text, tone);
    res.json({ rewrittenText });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;
