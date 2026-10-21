const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");

// GET ALL CHATS FOR LOGGED-IN USER
const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
      .populate("participants", "-password")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name avatar email"
        }
      })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (error) {
    next(error);
  }
};

// ACCESS OR CREATE A 1-ON-1 CHAT
const accessOrCreateChat = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      const error = new Error("UserId is required to access or create a chat");
      error.statusCode = 400;
      throw error;
    }

    if (userId === req.user._id.toString()) {
      const error = new Error("You cannot create a chat with yourself");
      error.statusCode = 400;
      throw error;
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      const error = new Error("Target user not found");
      error.statusCode = 404;
      throw error;
    }

    // Search for existing chat
    let isChat = await Chat.find({
      $and: [
        { participants: { $elemMatch: { $eq: req.user._id } } },
        { participants: { $elemMatch: { $eq: userId } } }
      ]
    })
      .populate("participants", "-password")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name avatar email"
        }
      });

    if (isChat.length > 0) {
      return res.json({
        success: true,
        chat: isChat[0]
      });
    }

    // Create new chat
    const newChat = await Chat.create({
      participants: [req.user._id, userId]
    });

    const fullChat = await Chat.findById(newChat._id).populate(
      "participants",
      "-password"
    );

    res.status(201).json({
      success: true,
      chat: fullChat
    });
  } catch (error) {
    next(error);
  }
};

// GET MESSAGES FOR A CHAT
const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      const error = new Error("Chat not found");
      error.statusCode = 404;
      throw error;
    }

    // Ensure user is part of this chat
    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      const error = new Error("Not authorized to access messages in this chat");
      error.statusCode = 403;
      throw error;
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name avatar email")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
};

// SEND A MESSAGE
const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      const error = new Error("Message content cannot be empty");
      error.statusCode = 400;
      throw error;
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      const error = new Error("Chat not found");
      error.statusCode = 404;
      throw error;
    }

    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      const error = new Error("Not authorized to send messages in this chat");
      error.statusCode = 403;
      throw error;
    }

    let message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      content: content.trim()
    });

    message = await message.populate("sender", "name avatar email");

    // Update lastMessage on Chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id
    });

    // Emit Socket.io event if available
    const io = req.app.get("io");
    if (io) {
      io.to(chatId).emit("receive_message", message);
    }

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChats,
  accessOrCreateChat,
  getMessages,
  sendMessage
};
