import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      maxlength: [100, "Group name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    avatar: {
      type: String,
      default: "https://ui-avatars.com/api/?name=Group&background=random",
    },
    coverImage: {
      type: String,
    },
    privacy: {
      type: String,
      enum: ["public", "private", "secret"],
      default: "public",
    },
    type: {
      type: String,
      enum: ["chat", "social"],
      default: "social",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pendingMembers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    invitations: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    bannedMembers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        bannedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
      },
    ],
    category: {
      type: String,
    },
    tags: [String],
    rules: [
      {
        title: String,
        description: String,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    postsEnabled: {
      type: Boolean,
      default: true,
    },
    memberApprovalRequired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
groupSchema.index({ members: 1 });
groupSchema.index({ admin: 1 });

const Group = mongoose.model("Group", groupSchema);

export default Group;
