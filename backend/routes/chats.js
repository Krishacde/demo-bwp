const express = require("express");
const {
  getChats,
  accessOrCreateChat,
  getMessages,
  sendMessage
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getChats);
router.post("/", accessOrCreateChat);
router.get("/:chatId/messages", getMessages);
router.post("/:chatId/messages", sendMessage);

module.exports = router;
