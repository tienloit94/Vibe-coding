import { Server } from "socket.io";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { verifyToken } from "../utils/jwt.js";
import { generateAIResponse } from "../utils/aiBotService.js";
import {
  generateOpenAIResponse,
  getOpenAIApiKey,
} from "../utils/openaiService.js";

// Store connected users
const connectedUsers = new Map(); // userId -> socketId

/**
 * Initialize Socket.io server
 * @param {object} server - HTTP server instance
 * @returns {Server} Socket.io server instance
 */
export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
      ],
      credentials: true,
    },
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.userId})`);

    // Store user connection
    connectedUsers.set(socket.userId, socket.id);

    // Update user online status
    User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      socketId: socket.id,
      lastSeen: new Date(),
    }).exec();

    // Send list of online users to the connected user
    const onlineUsers = Array.from(connectedUsers.keys());
    socket.emit("online-users", onlineUsers);

    // Notify all OTHER users that this user is online
    socket.broadcast.emit("user-online", socket.userId);

    // Also broadcast updated online users list to everyone
    io.emit("online-users", onlineUsers);

    /**
     * Handle get-online-users request
     */
    socket.on("get-online-users", () => {
      const onlineUsers = Array.from(connectedUsers.keys());
      socket.emit("online-users", onlineUsers);
    });

    /**
     * Handle setup event (join user's room)
     */
    socket.on("setup", () => {
      socket.join(socket.userId);
      socket.emit("connected");
    });

    /**
     * Handle join-chat event
     */
    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userId} joined chat: ${chatId}`);
    });

    /**
     * Handle typing event
     */
    socket.on("typing", (receiverId) => {
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", {
          userId: socket.userId,
          name: socket.user.name,
        });
      }
    });

    /**
     * Handle stop-typing event
     */
    socket.on("stop-typing", (receiverId) => {
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stop-typing", {
          userId: socket.userId,
        });
      }
    });

    /**
     * Handle new-message event (real-time message)
     */
    socket.on("new-message", async (data) => {
      try {
        const { receiverId, content, message: fileMessage } = data;

        let newMessage;

        // If message object is provided (from file upload), use it
        if (fileMessage) {
          newMessage = fileMessage;
        } else {
          // Create text message in database
          newMessage = await Message.create({
            sender: socket.userId,
            receiver: receiverId,
            content,
          });

          await newMessage.populate("sender", "name avatar isOnline");
          await newMessage.populate("receiver", "name avatar isOnline");
        }

        // Send to receiver if online
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message-received", newMessage);
        }

        // Send back to sender as confirmation
        socket.emit("message-sent", newMessage);

        // Check if receiver is AI Bot
        const receiver = await User.findById(receiverId);
        if (receiver && receiver.isAIBot) {
          // Generate AI response with delay
          setTimeout(async () => {
            let aiResponse;

            // Check if OpenAI API key is configured
            if (getOpenAIApiKey()) {
              aiResponse = await generateOpenAIResponse(content);
            } else {
              aiResponse = generateAIResponse(content);
            }

            // Create AI bot message
            const aiMessage = await Message.create({
              sender: receiverId, // AI Bot
              receiver: socket.userId, // Original sender
              content: aiResponse,
            });

            await aiMessage.populate("sender", "name avatar isOnline");
            await aiMessage.populate("receiver", "name avatar isOnline");

            // Send AI response to user
            const userSocketId = connectedUsers.get(socket.userId);
            if (userSocketId) {
              io.to(userSocketId).emit("message-received", aiMessage);
            }
          }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
        }
      } catch (error) {
        console.error("New message error:", error);
        socket.emit("message-error", {
          message: "Failed to send message",
        });
      }
    });

    /**
     * Handle message reaction
     */
    socket.on("message-reaction", async (data) => {
      try {
        const { messageId, receiverId } = data;

        // Fetch updated message with reactions
        const message = await Message.findById(messageId)
          .populate("sender", "name avatar isOnline")
          .populate("receiver", "name avatar isOnline");

        if (!message) {
          return socket.emit("reaction-error", {
            message: "Message not found",
          });
        }

        // Notify receiver if online
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message-reaction-updated", message);
        }

        // Confirm to sender
        socket.emit("message-reaction-updated", message);
      } catch (error) {
        console.error("Message reaction error:", error);
        socket.emit("reaction-error", { message: "Failed to update reaction" });
      }
    });

    /**
     * Handle message-read event
     */
    socket.on("message-read", async (data) => {
      try {
        const { senderId } = data;

        // Mark messages as read
        await Message.markAsRead(senderId, socket.userId);

        // Notify sender that messages were read
        const senderSocketId = connectedUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messages-read", {
            readBy: socket.userId,
          });
        }
      } catch (error) {
        console.error("Message read error:", error);
      }
    });

    /**
     * Handle disconnect event
     */
    socket.on("disconnect", () => {
      console.log(
        `❌ User disconnected: ${socket.user.name} (${socket.userId})`
      );

      // Remove from connected users
      connectedUsers.delete(socket.userId);

      // Update user offline status
      User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
        socketId: null,
      }).exec();

      // Notify all users that this user is offline
      socket.broadcast.emit("user-offline", socket.userId);

      // Broadcast updated online users list
      const onlineUsers = Array.from(connectedUsers.keys());
      io.emit("online-users", onlineUsers);
    });

    /**
     * Handle WebRTC video/voice call signaling
     */
    socket.on("call-user", ({ userToCall, signalData, from }) => {
      const recipientSocketId = connectedUsers.get(userToCall);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("call-made", {
          signal: signalData,
          from: from,
          callerName: socket.user.name,
        });
      }
    });

    socket.on("answer-call", ({ signal, to }) => {
      const recipientSocketId = connectedUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("call-accepted", signal);
      }
    });

    socket.on("end-call", ({ to }) => {
      const recipientSocketId = connectedUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("call-ended");
      }
    });
  });

  console.log("✅ Socket.io initialized");
  return { io, connectedUsers };
};

export { connectedUsers };
