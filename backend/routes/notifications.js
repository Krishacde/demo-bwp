const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/unread-count", async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, unreadCount });
  } catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("actor", "name role headline")
      .populate("idea", "title")
      .sort({ createdAt: -1 })
      .limit(100);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (error) { next(error); }
});

router.patch("/:notificationId/read", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.notificationId)) {
      return res.status(400).json({ success: false, message: "Invalid notification." });
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found." });
    res.json({ success: true, notification });
  } catch (error) { next(error); }
});

router.patch("/read-all", async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: "Notifications marked as read." });
  } catch (error) { next(error); }
});

module.exports = router;
