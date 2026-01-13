import mongoose from "mongoose";

const postLikeSchema = new mongoose.Schema(
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
    reactionType: {
      type: String,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
      default: "like",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: mỗi user chỉ like 1 post 1 lần
postLikeSchema.index({ user: 1, post: 1 }, { unique: true });
// Index for querying user's liked posts
postLikeSchema.index({ user: 1, createdAt: -1 });
// Index for querying post's likes
postLikeSchema.index({ post: 1, createdAt: -1 });

const PostLike = mongoose.model("PostLike", postLikeSchema);

export default PostLike;
