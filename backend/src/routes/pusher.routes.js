const express = require('express');

const auth = require('../middleware/auth.middleware');
const { authenticateOwnerChannel } = require('../services/pusher.service');

const router = express.Router();

router.post('/auth', auth.protect, (req, res) => {
  const { socket_id: socketId, channel_name: channelName } = req.body || {};

  if (!socketId || !channelName) {
    return res.status(400).json({ message: 'socket_id and channel_name are required' });
  }

  try {
    const authResponse = authenticateOwnerChannel(socketId, channelName, req.user._id);
    return res.status(200).json(authResponse);
  } catch (error) {
    return res.status(403).json({ message: error.message || 'Unauthorized' });
  }
});

module.exports = router;
