// require("dotenv").config();

// const express = require("express");

// // const cors = require("cors");
// const connectDB = require("./config/db");

// const app = express();
// const User = require("./models/User");


// // Connect Database
// connectDB();





// // // Middleware
// // app.use(cors());
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // Test Route
// app.get("/", (req, res) => {
//   res.send("🚀 Server is running...");
// });

// // Example API Route
// app.get("/api", (req, res) => {
//   res.json({
//     success: true,
//     message: "API is working!"
//   });
// });


// // Server
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });
require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const ideaRoutes = require("./routes/ideas");
const collaborationRoutes = require("./routes/collaborations");
const messageRoutes = require("./routes/messages");
const errorHandler = require("./middleware/errorHandler");
const User = require("./models/User");
const DirectConversation = require("./models/DirectConversation");
const notificationRoutes = require("./routes/notifications");
const createNotification = require("./utils/createNotification");

const app = express();
const server = http.createServer(app);
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


// =========================
// DATABASE
// =========================

connectDB();


// =========================
// MIDDLEWARE
// =========================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));


// Morgan HTTP logging
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

app.use("/api/ideas", ideaRoutes);
app.use("/api/collaborations", collaborationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);


// =========================
// 404 ROUTE
// =========================

app.use((req, res, next) => {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  error.statusCode = 404;

  next(error);
});


// =========================
// ERROR HANDLER
// =========================

app.use(errorHandler);


// =========================
// SERVER
// =========================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});
