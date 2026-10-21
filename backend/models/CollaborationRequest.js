const mongoose = require("mongoose");

const collaborationRequestSchema = new mongoose.Schema({
  idea: { type: mongoose.Schema.Types.ObjectId, ref: "Idea", required: true },
  founder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collaborator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, trim: true, maxlength: 80, default: "Collaborator" },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
}, { timestamps: true });

collaborationRequestSchema.index({ idea: 1, collaborator: 1 }, { unique: true });

module.exports = mongoose.model("CollaborationRequest", collaborationRequestSchema);
