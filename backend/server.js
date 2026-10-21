const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const http = require("node:http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chats");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
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
  console.log(`✅ Server running with Socket.io on http://localhost:${PORT}`);
});