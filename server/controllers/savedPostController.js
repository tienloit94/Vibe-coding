import PostLike from "../models/PostLike.js";
import SavedPost from "../models/SavedPost.js";
import Post from "../models/Post.js";

/**
 * @desc    Get user's liked posts
 * @route   GET /api/posts/liked
 * @access  Private
 */
export const getLikedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const likedPosts = await PostLike.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "post",
        populate: {
          path: "author",
          select: "name email avatar",
        },
      });

    const total = await PostLike.countDocuments({ user: req.user._id });

    res.status(200).json({
      posts: likedPosts
        .map((like) => like.post)
        .filter((post) => post !== null),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Error getting liked posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get user's saved posts
 * @route   GET /api/posts/saved
 * @access  Private
 */
export const getSavedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const collection = req.query.collection || "default";

    const savedPosts = await SavedPost.find({
      user: req.user._id,
      collection,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "post",
        populate: {
          path: "author",
          select: "name email avatar",
        },
      });

    const total = await SavedPost.countDocuments({
      user: req.user._id,
      collection,
    });

    res.status(200).json({
      posts: savedPosts
        .map((saved) => ({
          ...saved.post.toObject(),
          savedNotes: saved.notes,
          savedAt: saved.createdAt,
        }))
        .filter((post) => post._id),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Error getting saved posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Save a post
 * @route   POST /api/posts/:postId/save
 * @access  Private
 */
export const savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { collection = "default", notes } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if already saved
    const existingSave = await SavedPost.findOne({
      user: req.user._id,
      post: postId,
      collection,
    });

    if (existingSave) {
      return res.status(400).json({ message: "Post already saved" });
    }

    const savedPost = await SavedPost.create({
      user: req.user._id,
      post: postId,
      collection,
      notes,
    });

    res.status(201).json({
      message: "Post saved successfully",
      savedPost,
    });
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Unsave a post
 * @route   DELETE /api/posts/:postId/save
 * @access  Private
 */
export const unsavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { collection = "default" } = req.query;

    const result = await SavedPost.findOneAndDelete({
      user: req.user._id,
      post: postId,
      collection,
    });

    if (!result) {
      return res.status(404).json({ message: "Saved post not found" });
    }

    res.status(200).json({ message: "Post unsaved successfully" });
  } catch (error) {
    console.error("Error unsaving post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get user's saved collections
 * @route   GET /api/posts/saved/collections
 * @access  Private
 */
export const getSavedCollections = async (req, res) => {
  try {
    const collections = await SavedPost.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$collection",
          count: { $sum: 1 },
          lastSaved: { $max: "$createdAt" },
        },
      },
      { $sort: { lastSaved: -1 } },
    ]);

    res.status(200).json({ collections });
  } catch (error) {
    console.error("Error getting collections:", error);
    res.status(500).json({ message: "Server error" });
  }
};
