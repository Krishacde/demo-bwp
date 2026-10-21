const mongoose = require("mongoose");

const directMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now }
});

const directConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  participantKey: { type: String, required: true, unique: true },
  messages: [directMessageSchema]
}, { timestamps: true });

module.exports = mongoose.model("DirectConversation", directConversationSchema);
