const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["direct_message", "idea_message", "collaboration_request", "collaboration_accepted", "collaboration_rejected"],
    required: true
  },
  idea: { type: mongoose.Schema.Types.ObjectId, ref: "Idea" },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "DirectConversation" },
  collaborationRequest: { type: mongoose.Schema.Types.ObjectId, ref: "CollaborationRequest" },
  preview: { type: String, trim: true, maxlength: 160, default: "" },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
