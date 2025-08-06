const logger = require('./../utils/log4j.config').getLogger();
const admin = require('firebase-admin');

// Initialize Firebase Admin with your service account
const serviceAccount = require('../../firebase-service-account.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to send push notification
async function sendPushNotification(fcmToken, title, body, data) {

  let result;
  let notification =  {
      title: title,
      body: body.toString(),
      data: data
    }
  const message = {
    token: fcmToken,
    // notification: {
    //   title: title,
    //   body: body.toString(),
    // },
    // Optional data payload
    data: {
      payload: JSON.stringify(notification)
    }
  };

  try {
    logger.debug("Sending push message", message);
    const response = await admin.messaging().send(message);

    logger.debug('Successfully sent message:', response);
    result = 0
  } catch (error) {
    if (error.code === 'messaging/invalid-argument' || 
        error.code === 'messaging/registration-token-not-registered' ||
        error.code === 'messaging/invalid-registration-token'
    ) {
        logger.error('FCM token is invalid or expired:', error.code);
        result = 1; // Invalid token
    } else {
        result = 2; // Other error
        logger.error('An error occurred while sending the notification:', error);
    }
  }
  return result;
}

module.exports = {
  sendPushNotification,
};

// Example usage:
// const userFcmToken = '<PASTE_USER_FCM_TOKEN_HERE>';
// sendPushNotification(userFcmToken, 'Hello from Node.js', 'This is your notification!');
