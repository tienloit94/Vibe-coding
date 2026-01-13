import mongoose from "mongoose";

const savedPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    collection: {
      type: String,
      default: "default", // Có thể tạo nhiều collection: "favorites", "read_later", etc.
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: mỗi user chỉ save 1 post 1 lần trong 1 collection
savedPostSchema.index({ user: 1, post: 1, collection: 1 }, { unique: true });
// Index for querying user's saved posts
savedPostSchema.index({ user: 1, createdAt: -1 });
// Index for querying by collection
savedPostSchema.index({ user: 1, collection: 1, createdAt: -1 });

const SavedPost = mongoose.model("SavedPost", savedPostSchema);

export default SavedPost;
