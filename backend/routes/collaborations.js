const express = require("express");
const mongoose = require("mongoose");
const CollaborationRequest = require("../models/CollaborationRequest");
const DirectConversation = require("../models/DirectConversation");
const Idea = require("../models/Idea");
const createNotification = require("../utils/createNotification");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

const fail = (res, status, message) => res.status(status).json({ success: false, message });

router.post("/ideas/:ideaId/requests", authorizeRoles("collaborator"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.ideaId)) return fail(res, 400, "Invalid idea.");
    const idea = await Idea.findById(req.params.ideaId);
    if (!idea) return fail(res, 404, "Idea not found.");
    if (idea.author.equals(req.user._id)) return fail(res, 400, "You cannot request to join your own idea.");
    const message = String(req.body.message || "").trim();
    if (!message) return fail(res, 400, "Add a short introduction with your request.");
    const request = await CollaborationRequest.create({
      idea: idea._id, founder: idea.author, collaborator: req.user._id,
      role: String(req.body.role || "Collaborator").trim().slice(0, 80), message
    });
    await createNotification({
      recipient: idea.author,
      actor: req.user._id,
      type: "collaboration_request",
      idea: idea._id,
      collaborationRequest: request._id,
      preview: message
    });
    res.status(201).json({ success: true, request });
  } catch (error) {
    if (error.code === 11000) return fail(res, 409, "You have already requested to join this idea.");
    next(error);
  }
});

router.get("/my-requests", async (req, res, next) => {
  try {
    const filter = req.user.role === "founder" ? { founder: req.user._id } : { collaborator: req.user._id };
    const requests = await CollaborationRequest.find(filter)
      .populate("idea", "title")
      .populate("founder", "name")
      .populate("collaborator", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) { next(error); }
});

router.patch("/:requestId/status", authorizeRoles("founder"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.requestId)) return fail(res, 400, "Invalid request.");
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) return fail(res, 400, "Choose accepted or rejected.");
    const request = await CollaborationRequest.findById(req.params.requestId);
    if (!request) return fail(res, 404, "Request not found.");
    if (!request.founder.equals(req.user._id)) return fail(res, 403, "Only this idea's founder can respond.");
    if (request.status !== "pending") return fail(res, 400, "This request already has a response.");
    if (status === "accepted") {
      const participants = [String(request.founder), String(request.collaborator)].sort();
      const participantKey = participants.join(":");
      await DirectConversation.findOneAndUpdate(
        { participantKey },
        { $setOnInsert: { participants, participantKey } },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
    request.status = status;
    await request.save();
    if (status === "accepted") {
      await Idea.findByIdAndUpdate(request.idea, { $addToSet: { teamMembers: request.collaborator } });
    }
    await createNotification({
      recipient: request.collaborator,
      actor: req.user._id,
      type: status === "accepted" ? "collaboration_accepted" : "collaboration_rejected",
      idea: request.idea,
      collaborationRequest: request._id
    });
    res.json({ success: true, request });
  } catch (error) { next(error); }
});

module.exports = router;
