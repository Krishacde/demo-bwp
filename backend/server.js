const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const http = require("node:http");
const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chats");
const errorHandler = require("./middleware/errorHandler");
const User = require("./models/User");
const DirectConversation = require("./models/DirectConversation");
const notificationRoutes = require("./routes/notifications");
const createNotification = require("./utils/createNotification");

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
const io = new Server(server, { cors: { origin: true, methods: ["GET", "POST"] } });

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Please sign in to use chat."));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name role");
    if (!user) return next(new Error("Your account could not be found."));
    socket.user = user;
    next();
  } catch (error) { next(new Error("Your session has expired. Please sign in again.")); }
});

io.on("connection", (socket) => {
  socket.on("direct:join", async ({ conversationId } = {}, done = () => {}) => {
    try {
      const conversation = await DirectConversation.findById(conversationId);
      const isMember = conversation?.participants.some((participant) => participant.equals(socket.user._id));
      if (!isMember) return done({ error: "You are not part of this chat." });
      await socket.join(`direct:${conversation._id}`);
      await conversation.populate("messages.sender", "name");
      socket.emit("direct:history", conversation.messages);
      done({ success: true });
    } catch (error) { done({ error: "Could not open this chat." }); }
  });

  socket.on("direct:send", async ({ conversationId, text } = {}, done = () => {}) => {
    try {
      const cleanText = String(text || "").trim();
      if (!cleanText || cleanText.length > 2000) return done({ error: "Message must be 1 to 2000 characters." });
      const conversation = await DirectConversation.findById(conversationId);
      const isMember = conversation?.participants.some((participant) => participant.equals(socket.user._id));
      if (!isMember) return done({ error: "You are not part of this chat." });
      conversation.messages.push({ sender: socket.user._id, text: cleanText });
      await conversation.save();
      const savedMessage = conversation.messages[conversation.messages.length - 1];
      const message = { ...savedMessage.toObject(), sender: { _id: socket.user._id, name: socket.user.name } };
      const recipient = conversation.participants.find((participant) => !participant.equals(socket.user._id));
      await createNotification({ recipient, actor: socket.user._id, type: "direct_message", conversation: conversation._id, preview: cleanText });
      io.to(`direct:${conversation._id}`).emit("direct:message", message);
      done({ success: true });
    } catch (error) { done({ error: "Message could not be sent." }); }
  });
});

// Attach io instance to express app
app.set("io", io);

// =========================
// DATABASE
// =========================

connectDB();

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// =========================
// ROUTES
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Auth server is running"
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API is working"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);

// =========================
// SOCKET.IO REAL-TIME CHAT
// =========================

const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // Register online user
  socket.on("setup", (userData) => {
    if (userData && (userData._id || userData.id)) {
      const userId = (userData._id || userData.id).toString();
      socket.userId = userId;
      onlineUsers.set(userId, socket.id);
      socket.join(userId);

      console.log(`👤 User registered online: ${userId}`);
      io.emit("get_online_users", Array.from(onlineUsers.keys()));
    }
  });

  // Join a specific chat room
  socket.on("join_chat", (room) => {
    const roomId = typeof room === "object" ? room.chatId || room.room : room;
    if (roomId) {
      socket.join(roomId);
      console.log(`📌 Socket ${socket.id} joined room: ${roomId}`);
    }
  });

  // Leave a specific chat room
  socket.on("leave_chat", (room) => {
    const roomId = typeof room === "object" ? room.chatId || room.room : room;
    if (roomId) {
      socket.leave(roomId);
      console.log(`🚪 Socket ${socket.id} left room: ${roomId}`);
    }
  });

  // Send message via socket
  socket.on("send_message", (newMessageReceived) => {
    const chatId = newMessageReceived.chat?._id || newMessageReceived.chatId || newMessageReceived.chat;
    if (chatId) {
      socket.to(chatId).emit("receive_message", newMessageReceived);
    }
  });

  // Typing indicators
  socket.on("typing", (data) => {
    const roomId = typeof data === "object" ? data.chatId || data.room : data;
    if (roomId) {
      socket.to(roomId).emit("typing", data);
    }
  });

  socket.on("stop_typing", (data) => {
    const roomId = typeof data === "object" ? data.chatId || data.room : data;
    if (roomId) {
      socket.to(roomId).emit("stop_typing", data);
    }
  });

  // Disconnect handler
  socket.on("disconnect", () => {
    console.log(`🔥 Socket disconnected: ${socket.id}`);
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("get_online_users", Array.from(onlineUsers.keys()));
    }
  });
});
app.use("/api/ideas", ideaRoutes);
app.use("/api/collaborations", collaborationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);


// =========================
// 404 ROUTE
// =========================

app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// =========================
// ERROR HANDLER
// =========================

app.use(errorHandler);

// =========================
// SERVER START
// =========================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});
