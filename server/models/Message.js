import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
    },
    content: {
      type: String,
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    messageType: {
      type: String,
      enum: ["text", "file", "image", "video", "audio"],
      default: "text",
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        emoji: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for faster queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function (userId1, userId2) {
  return this.find({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 },
    ],
  })
    .populate("sender", "name avatar isOnline")
    .populate("receiver", "name avatar isOnline")
    .sort({ createdAt: 1 }); // Oldest first
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = async function (senderId, receiverId) {
  return this.updateMany(
    {
      sender: senderId,
      receiver: receiverId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );
};

const Message = mongoose.model("Message", messageSchema);

export default Message;
