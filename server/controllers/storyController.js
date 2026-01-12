import Story from "../models/Story.js";
import User from "../models/User.js";

/**
 * @desc    Create a story
 * @route   POST /api/stories
 * @access  Private
 */
export const createStory = async (req, res) => {
  try {
    const { content, backgroundColor } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Media file is required",
      });
    }

    // Determine media type from file mimetype
    const mediaType = req.file.mimetype.startsWith("video/")
      ? "video"
      : "image";

    // Story expires after 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = await Story.create({
      author: req.user._id,
      content: content || "",
      media: `/uploads/${req.file.filename}`,
      mediaType,
      backgroundColor: backgroundColor || "#000000",
      expiresAt,
    });

    await story.populate("author", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      story,
    });
  } catch (error) {
    console.error("Create story error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create story",
      error: error.message,
    });
  }
};

/**
 * @desc    Get active stories (from friends and user)
 * @route   GET /api/stories
 * @access  Private
 */
export const getStories = async (req, res) => {
  try {
    // Get user's friends
    const user = await User.findById(req.user._id).select("friends");

    // Get stories from friends and user, not expired
    const stories = await Story.find({
      author: { $in: [...user.friends, req.user._id] },
      expiresAt: { $gt: new Date() },
    })
      .populate("author", "name email avatar")
      .populate("reactions.user", "name avatar")
      .populate("replies.user", "name avatar")
      .sort({ createdAt: -1 });

    // Filter replies for each story (only show user's own replies or all if author)
    const filteredStories = stories.map((story) => {
      const storyObj = story.toObject();

      if (storyObj.replies) {
        storyObj.replies = storyObj.replies.filter(
          (r) =>
            r.user._id.toString() === req.user._id.toString() ||
            story.author._id.toString() === req.user._id.toString()
        );
      }

      return storyObj;
    });

    // Group stories by author
    const groupedStories = filteredStories.reduce((acc, story) => {
      const authorId = story.author._id.toString();
      if (!acc[authorId]) {
        acc[authorId] = {
          author: story.author,
          stories: [],
        };
      }
      acc[authorId].stories.push(story);
      return acc;
    }, {});

    const result = Object.values(groupedStories);

    res.status(200).json({
      success: true,
      count: result.length,
      stories: result,
    });
  } catch (error) {
    console.error("Get stories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get stories",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's own stories
 * @route   GET /api/stories/my-stories
 * @access  Private
 */
export const getMyStories = async (req, res) => {
  try {
    const stories = await Story.find({
      author: req.user._id,
      expiresAt: { $gt: new Date() },
    })
      .populate("author", "name email avatar")
      .populate("viewers.user", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stories.length,
      stories,
    });
  } catch (error) {
    console.error("Get my stories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get stories",
      error: error.message,
    });
  }
};

/**
 * @desc    Mark story as viewed
 * @route   POST /api/stories/:storyId/view
 * @access  Private
 */
export const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Check if already viewed
    const alreadyViewed = story.viewers.some(
      (viewer) => viewer.user.toString() === req.user._id.toString()
    );

    if (!alreadyViewed) {
      story.viewers.push({
        user: req.user._id,
        viewedAt: new Date(),
      });
      await story.save();
    }

    res.status(200).json({
      success: true,
      message: "Story viewed",
    });
  } catch (error) {
    console.error("View story error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to view story",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete story
 * @route   DELETE /api/stories/:storyId
 * @access  Private
 */
export const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Check if user is the author
    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await story.deleteOne();

    res.status(200).json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error("Delete story error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete story",
      error: error.message,
    });
  }
};

/**
 * @desc    Add reaction to story
 * @route   POST /api/stories/:storyId/reaction
 * @access  Private
 */
export const addReaction = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: "Emoji is required",
      });
    }

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Check if story expired
    if (new Date() > story.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Story has expired",
      });
    }

    // Check if user already reacted
    const existingReaction = story.reactions.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReaction) {
      // Update reaction
      existingReaction.emoji = emoji;
      existingReaction.createdAt = new Date();
    } else {
      // Add new reaction
      story.reactions.push({
        user: req.user._id,
        emoji,
      });
    }

    await story.save();

    await story.populate("reactions.user", "name avatar");

    res.status(200).json({
      success: true,
      message: "Reaction added successfully",
      reactions: story.reactions,
    });
  } catch (error) {
    console.error("Add reaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add reaction",
      error: error.message,
    });
  }
};

/**
 * @desc    Remove reaction from story
 * @route   DELETE /api/stories/:storyId/reaction
 * @access  Private
 */
export const removeReaction = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    story.reactions = story.reactions.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );

    await story.save();

    res.status(200).json({
      success: true,
      message: "Reaction removed successfully",
    });
  } catch (error) {
    console.error("Remove reaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove reaction",
      error: error.message,
    });
  }
};

/**
 * @desc    Add reply to story
 * @route   POST /api/stories/:storyId/reply
 * @access  Private
 */
export const addReply = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Check if story expired
    if (new Date() > story.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Story has expired",
      });
    }

    // Add reply
    story.replies.push({
      user: req.user._id,
      message: message.trim(),
    });

    await story.save();

    await story.populate("replies.user", "name avatar");

    // Only return replies visible to current user
    // (their own replies or all replies if they're the story author)
    const visibleReplies = story.replies.filter(
      (r) =>
        r.user._id.toString() === req.user._id.toString() ||
        story.author.toString() === req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      replies: visibleReplies,
    });
  } catch (error) {
    console.error("Add reply error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add reply",
      error: error.message,
    });
  }
};

/**
 * @desc    Get story replies (only author and reply owners can see)
 * @route   GET /api/stories/:storyId/replies
 * @access  Private
 */
export const getReplies = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId).populate(
      "replies.user",
      "name avatar"
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Only return replies visible to current user
    const visibleReplies = story.replies.filter(
      (r) =>
        r.user._id.toString() === req.user._id.toString() ||
        story.author.toString() === req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      replies: visibleReplies,
    });
  } catch (error) {
    console.error("Get replies error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get replies",
      error: error.message,
    });
  }
};
