const express = require("express");

const {
  getIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea
} = require("../controllers/ideaController");

// const { protect } = require("../middleware/auth");


const router = express.Router();
const {
  protect,
  authorizeRoles
} = require("../middleware/auth");

router.post(
  "/",
  protect,
  authorizeRoles("founder"),
  createIdea
);

router.get("/", getIdeas);

router.get("/:id", getIdeaById);

router.put("/:id", protect, updateIdea);

router.delete("/:id", protect, deleteIdea);

module.exports = router;
