const Notification = require("../models/Notification");

const createNotification = async (details) => {
  try {
    await Notification.create(details);
  } catch (error) {
    console.error("Could not save notification:", error.message);
  }
};

module.exports = createNotification;
