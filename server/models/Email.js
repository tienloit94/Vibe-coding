import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
      lowercase: true,
    },
    from: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["password_reset", "verification", "notification", "welcome"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "demo"],
      default: "pending",
    },
    messageId: {
      type: String,
    },
    content: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    error: {
      type: String,
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying
emailSchema.index({ to: 1, createdAt: -1 });
emailSchema.index({ type: 1, status: 1 });

const Email = mongoose.model("Email", emailSchema);

export default Email;
