const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const DirectConversation = require("../models/DirectConversation");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

const isParticipant = (conversation, userId) =>
  conversation.participants.some((participant) => participant.equals(userId));

router.get("/users", async (req, res, next) => {
  try {
    const filter = { _id: { $ne: req.user._id } };
    const search = String(req.query.search || "").trim();
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { headline: { $regex: safeSearch, $options: "i" } },
        { skills: { $regex: safeSearch, $options: "i" } }
      ];
    }
    const users = await User.find(filter).select("name role headline skills").sort({ name: 1 }).limit(50);
    res.json({ success: true, users });
  } catch (error) { next(error); }
});

router.get("/conversations", async (req, res, next) => {
  try {
    const conversations = await DirectConversation.find({ participants: req.user._id })
      .populate("participants", "name role headline")
      .sort({ updatedAt: -1 });
    res.json({ success: true, conversations });
  } catch (error) { next(error); }
});

router.post("/conversations/:userId", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ success: false, message: "Invalid user." });
    }
    const otherUser = await User.findById(req.params.userId).select("_id");
    if (!otherUser) return res.status(404).json({ success: false, message: "User not found." });
    if (otherUser._id.equals(req.user._id)) return res.status(400).json({ success: false, message: "You cannot start a chat with yourself." });

    const participants = [String(req.user._id), String(otherUser._id)].sort();
    const participantKey = participants.join(":");
    const conversation = await DirectConversation.findOneAndUpdate(
      { participantKey },
      { $setOnInsert: { participants, participantKey } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("participants", "name role headline");
    res.json({ success: true, conversation });
  } catch (error) { next(error); }
});

router.get("/conversations/:conversationId/messages", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.conversationId)) {
      return res.status(400).json({ success: false, message: "Invalid conversation." });
    }
    const conversation = await DirectConversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found." });
    if (!isParticipant(conversation, req.user._id)) return res.status(403).json({ success: false, message: "You are not part of this conversation." });
    await conversation.populate("messages.sender", "name");
    res.json({ success: true, messages: conversation.messages });
  } catch (error) { next(error); }
});

module.exports = router;
