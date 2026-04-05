const Pusher = require('pusher');

let pusherClient = null;

function getPusherClient() {
  if (pusherClient) {
    return pusherClient;
  }

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  pusherClient = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusherClient;
}

async function triggerOwnerEnquiryNotification(ownerId, payload) {
  return triggerOwnerNotification(ownerId, payload, 'enquiry.created');
}

async function triggerOwnerNotification(ownerId, payload, eventName = 'notification.created') {
  const client = getPusherClient();
  if (!client) {
    return false;
  }

  const channelName = `private-owner-${String(ownerId)}`;
  await client.trigger(channelName, eventName, payload);
  return true;
}

function authenticateOwnerChannel(socketId, channelName, userId) {
  const client = getPusherClient();
  if (!client) {
    throw new Error('Pusher is not configured');
  }

  const expectedChannel = `private-owner-${String(userId)}`;
  if (channelName !== expectedChannel) {
    throw new Error('Unauthorized channel access');
  }

  if (typeof client.authorizeChannel === 'function') {
    return client.authorizeChannel(socketId, channelName);
  }

  if (typeof client.authenticate === 'function') {
    return client.authenticate(socketId, channelName);
  }

  throw new Error('Unsupported Pusher auth method');
}

module.exports = {
  getPusherClient,
  triggerOwnerNotification,
  triggerOwnerEnquiryNotification,
  authenticateOwnerChannel,
};
