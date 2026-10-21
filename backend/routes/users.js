const express = require("express");
const {
  getUsers,
  getUserById,
  updateProfile,
  followUser,
  unfollowUser
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", getUsers);
router.put("/profile", protect, updateProfile);
router.get("/:id", getUserById);
router.post("/:id/follow", protect, followUser);
router.put("/:id/follow", protect, followUser);
router.post("/:id/unfollow", protect, unfollowUser);
router.put("/:id/unfollow", protect, unfollowUser);

module.exports = router;
