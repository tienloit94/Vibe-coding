import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Import configurations
import connectDB from './config/database.js';
import { initializeSocket } from './config/socket.js';
import { createAIBot } from './utils/createAIBot.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import postRoutes from './routes/postRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import blockRoutes from './routes/blockRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Import middleware
import { errorHandler, notFound } from './middleware/error.js';
import { generalLimiter, authLimiter, messageLimiter, postLimiter, friendRequestLimiter } from './middleware/rateLimiter.js';

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
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5174', // Additional port in case 5173 is busy
      'http://localhost:5175',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply general rate limiter to all API routes
app.use('/api/', generalLimiter);

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chat API is running',
    version: '1.0.0',
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageLimiter, messageRoutes);
app.use('/api/friends', friendRequestLimiter, friendRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/posts', postLimiter, postRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/block', blockRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 Server running on port ${PORT}     ║
║   📡 Environment: ${process.env.NODE_ENV || 'development'}        ║
║   🔗 URL: http://localhost:${PORT}       ║
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
