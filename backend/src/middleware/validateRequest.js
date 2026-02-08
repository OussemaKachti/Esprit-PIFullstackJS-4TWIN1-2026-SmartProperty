const validTones = ['modern', 'luxury', 'professional'];

function validateToneChangerRequest(req, res, next) {
  const { text, tone } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required as a string.' });
  }
  if (!tone || !validTones.includes(tone)) {
    return res.status(400).json({ error: 'tone must be one of modern, luxury, professional.' });
  }

  next();
}

module.exports = validateToneChangerRequest;
