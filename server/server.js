import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Import configurations
import connectDB from "./config/database.js";
import { initializeSocket } from "./config/socket.js";
import { createAIBot } from "./utils/createAIBot.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import blockRoutes from "./routes/blockRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";

// Import middleware
import { errorHandler, notFound } from "./middleware/error.js";
import {
  generalLimiter,
  authLimiter,
  messageLimiter,
  postLimiter,
  friendRequestLimiter,
} from "./middleware/rateLimiter.js";

// Initialize Express app
const app = express();
const server = createServer(app);

// Connect to database
connectDB();

// Create AI Bot after database connection
setTimeout(() => {
  createAIBot();
}, 2000);

// Initialize Socket.io
const { io, connectedUsers } = initializeSocket(server);

// Make io and connectedUsers accessible in routes
app.set("io", io);
app.set("connectedUsers", connectedUsers);

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5174", // Additional port in case 5173 is busy
      "http://localhost:5175",
      "http://localhost:8080", // Docker client port
      "http://localhost:3000", // Docker alternative port
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory with proper headers
app.use(
  "/uploads",
  (req, res, next) => {
    // Set CORS headers for media files
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Range");
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Range, Accept-Ranges"
    );

    // Set proper MIME types for videos based on extension
    const ext = path.extname(req.path).toLowerCase();
    if (ext === ".mp4") {
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Accept-Ranges", "bytes");
    } else if (ext === ".webm") {
      res.setHeader("Content-Type", "video/webm");
      res.setHeader("Accept-Ranges", "bytes");
    } else if (ext === ".ogg" || ext === ".ogv") {
      res.setHeader("Content-Type", "video/ogg");
      res.setHeader("Accept-Ranges", "bytes");
    } else if (ext === ".mov") {
      res.setHeader("Content-Type", "video/quicktime");
      res.setHeader("Accept-Ranges", "bytes");
    } else if (ext === ".avi") {
      res.setHeader("Content-Type", "video/x-msvideo");
      res.setHeader("Accept-Ranges", "bytes");
    } else if (ext === ".mkv") {
      res.setHeader("Content-Type", "video/x-matroska");
      res.setHeader("Accept-Ranges", "bytes");
    } else if (ext === ".wmv") {
      res.setHeader("Content-Type", "video/x-ms-wmv");
      res.setHeader("Accept-Ranges", "bytes");
    } else if (ext === ".flv") {
      res.setHeader("Content-Type", "video/x-flv");
      res.setHeader("Accept-Ranges", "bytes");
    }
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// Apply general rate limiter to all API routes
app.use("/api/", generalLimiter);

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Chat API is running",
    version: "1.0.0",
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageLimiter, messageRoutes);
app.use("/api/friends", friendRequestLimiter, friendRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/posts", postLimiter, postRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/block", blockRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/products", productRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 Server running on port ${PORT}     ║
║   📡 Environment: ${process.env.NODE_ENV || "development"}        ║
║   🔗 URL: http://localhost:${PORT}       ║
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});
