const express = require("express");

const {
  register,
  login,
  getMe,
  updateProfile,
  getPublicProfile
} = require("../controllers/authController");

const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", protect, getMe);
router.patch("/me", protect, updateProfile);
router.get("/users/:userId", protect, getPublicProfile);

module.exports = router;
