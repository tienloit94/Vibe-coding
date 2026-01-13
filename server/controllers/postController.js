import Post from "../models/Post.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import { containsOffensiveWords } from "../utils/contentModeration.js";
import { createNotification } from "./notificationController.js";

// Extract mentioned user IDs from content (@username format)
const extractMentions = (content) => {
  const mentionPattern = /@\[([^\]]+)\]\(([^\)]+)\)/g;
  const mentions = [];
  let match;
  while ((match = mentionPattern.exec(content)) !== null) {
    mentions.push(match[2]); // Extract user ID
  }
  return mentions;
};

// Create new post
export const createPost = async (req, res) => {
  try {
    const { content, visibility, taggedUsers, group, isAnonymous } = req.body;

    // Handle uploaded files
    const images = [];
    let video = null;

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const filePath = `/uploads/${file.filename}`;
        // Check if file is video
        if (file.mimetype.startsWith("video/")) {
          video = filePath;
        } else {
          images.push(filePath);
        }
      });
    }

    // Parse taggedUsers if it's a string
    let taggedUsersArray = [];
    if (taggedUsers) {
      taggedUsersArray =
        typeof taggedUsers === "string" ? JSON.parse(taggedUsers) : taggedUsers;
    }

    const postData = {
      author: req.user._id,
      content,
      taggedUsers: taggedUsersArray,
      visibility: visibility || "friends",
      group: group || null,
      isAnonymous: isAnonymous === "true" || isAnonymous === true || false,
    };

    // Add images or video
    if (video) {
      postData.video = video;
    } else if (images.length > 0) {
      postData.images = images;
    }

    const post = await Post.create(postData);

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name email avatar")
      .populate("taggedUsers", "name avatar");

    console.log("Post created with tagged users:", taggedUsersArray);

    // Send notifications to tagged users
    if (taggedUsersArray && taggedUsersArray.length > 0) {
      console.log("Sending notifications to tagged users...");
      for (const userId of taggedUsersArray) {
        if (userId !== req.user._id.toString()) {
          console.log(`Creating notification for user ${userId}`);
          await createNotification(
            userId,
            req.user._id,
            "post_tag",
            `${req.user.name} đã gắn thẻ bạn trong một bài viết`,
            post._id,
            `/home?postId=${post._id}`
          );
        }
      }
    }

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get news feed (posts from friends and own posts)
export const getNewsFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's friends from User model
    const user = await User.findById(req.user._id).select("friends");
    const friendIds = user.friends || [];

    // Add own user ID
    const userIds = [...friendIds, req.user._id];

    // Get posts from friends and self
    const posts = await Post.find({
      author: { $in: userIds },
      visibility: { $in: ["public", "friends"] },
    })
      .populate("author", "name email avatar")
      .populate("taggedUsers", "name avatar")
      .populate("comments.user", "name avatar")
      .populate("comments.replies.user", "name avatar")
      .populate("likes", "name avatar")
      .populate("shares.user", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({
      author: { $in: userIds },
      visibility: { $in: ["public", "friends"] },
    });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Error fetching news feed:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: userId })
      .populate("author", "name email avatar")
      .populate("taggedUsers", "name avatar")
      .populate("comments.user", "name avatar")
      .populate("comments.replies.user", "name avatar")
      .populate("likes", "name avatar")
      .populate("shares.user", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: userId });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Like/Unlike post
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "name email avatar")
      .populate("taggedUsers", "name avatar")
      .populate("likes", "name avatar");

    res.json(updatedPost);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add/Update reaction to post (like, love, haha, wow, sad, angry)
export const addReaction = async (req, res) => {
  try {
    const { postId } = req.params;
    const { type } = req.body; // type: 'like', 'love', 'haha', 'wow', 'sad', 'angry'

    if (!["like", "love", "haha", "wow", "sad", "angry"].includes(type)) {
      return res.status(400).json({
        message: "Invalid reaction type",
        success: false,
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Check if user already reacted
    const existingReactionIndex = post.reactions.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    const isNewReaction = existingReactionIndex === -1;

    if (existingReactionIndex > -1) {
      // Update existing reaction
      post.reactions[existingReactionIndex].type = type;
      post.reactions[existingReactionIndex].createdAt = new Date();
    } else {
      // Add new reaction
      post.reactions.push({
        user: req.user._id,
        type,
      });
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "name email avatar")
      .populate("taggedUsers", "name avatar")
      .populate("likes", "name avatar")
      .populate("reactions.user", "name avatar");

    // Only send notifications for new reactions, not updates
    if (isNewReaction) {
      const reactionMessages = {
        like: "đã thích bài viết của bạn",
        love: "đã yêu thích bài viết của bạn",
        haha: "đã cảm thấy buồn cười về bài viết của bạn",
        wow: "đã ngạc nhiên về bài viết của bạn",
        sad: "đã cảm thấy buồn về bài viết của bạn",
        angry: "đã phẫn nộ về bài viết của bạn",
      };

      const tagReactionMessages = {
        like: "đã thích bài viết bạn được gắn thẻ",
        love: "đã yêu thích bài viết bạn được gắn thẻ",
        haha: "đã cảm thấy buồn cười về bài viết bạn được gắn thẻ",
        wow: "đã ngạc nhiên về bài viết bạn được gắn thẻ",
        sad: "đã cảm thấy buồn về bài viết bạn được gắn thẻ",
        angry: "đã phẫn nộ về bài viết bạn được gắn thẻ",
      };

      // Notify post author about reaction
      if (post.author.toString() !== req.user._id.toString()) {
        await createNotification(
          post.author,
          req.user._id,
          "reaction",
          reactionMessages[type],
          post._id,
          `/home?postId=${post._id}`
        );
      }

      // Notify tagged users about reaction on their tagged post
      if (updatedPost.taggedUsers && updatedPost.taggedUsers.length > 0) {
        for (const taggedUser of updatedPost.taggedUsers) {
          if (
            taggedUser._id.toString() !== req.user._id.toString() &&
            taggedUser._id.toString() !== post.author.toString()
          ) {
            await createNotification(
              taggedUser._id,
              req.user._id,
              "reaction",
              tagReactionMessages[type],
              post._id,
              `/home?postId=${post._id}`
            );
          }
        }
      }
    }

    res.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Remove reaction from post
export const removeReaction = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Remove user's reaction
    post.reactions = post.reactions.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "name email avatar")
      .populate("taggedUsers", "name avatar")
      .populate("likes", "name avatar")
      .populate("reactions.user", "name avatar");

    res.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error removing reaction:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    // Check for offensive words
    const isOffensive = containsOffensiveWords(content);

    // Extract mentioned users
    const mentionedUsers = extractMentions(content);

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.user._id,
      content,
      mentionedUsers,
    });

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "name email avatar")
      .populate("taggedUsers", "name avatar")
      .populate("comments.user", "name avatar")
      .populate("comments.mentionedUsers", "name avatar")
      .populate("comments.replies.user", "name avatar")
      .populate("comments.replies.mentionedUsers", "name avatar")
      .populate("likes", "name avatar")
      .populate("shares.user", "name avatar");
    // Notify post author about comment
    if (post.author.toString() !== req.user._id.toString()) {
      await createNotification(
        post.author,
        req.user._id,
        "comment",
        "đã bình luận bài viết của bạn",
        post._id,
        `/home?postId=${post._id}`
      );
    }

    // Notify tagged users about comment on their tagged post
    if (updatedPost.taggedUsers && updatedPost.taggedUsers.length > 0) {
      for (const taggedUser of updatedPost.taggedUsers) {
        if (
          taggedUser._id.toString() !== req.user._id.toString() &&
          taggedUser._id.toString() !== post.author.toString()
        ) {
          await createNotification(
            taggedUser._id,
            req.user._id,
            "comment",
            "đã bình luận bài viết bạn được gắn thẻ",
            post._id,
            `/home?postId=${post._id}`
          );
        }
      }
    }
    // Notify post author about comment
    if (post.author.toString() !== req.user._id.toString()) {
      await createNotification(
        post.author,
        req.user._id,
        "comment",
        "đã bình luận bài viết của bạn",
        post._id,
        `/home?postId=${post._id}`
      );
    }

    // Notify tagged users about comment on their tagged post
    if (updatedPost.taggedUsers && updatedPost.taggedUsers.length > 0) {
      for (const taggedUser of updatedPost.taggedUsers) {
        if (
          taggedUser._id.toString() !== req.user._id.toString() &&
          taggedUser._id.toString() !== post.author.toString()
        ) {
          await createNotification(
            taggedUser._id,
            req.user._id,
            "comment",
            "đã bình luận bài viết bạn được gắn thẻ",
            post._id,
            `/home?postId=${post._id}`
          );
        }
      }
    }

    // Send notifications to mentioned users
    if (mentionedUsers && mentionedUsers.length > 0) {
      for (const userId of mentionedUsers) {
        if (userId !== req.user._id.toString()) {
          await createNotification(
            userId,
            req.user._id,
            "comment_mention",
            `${req.user.name} đã nhắc đến bạn trong một bình luận`,
            post._id,
            `/home?postId=${post._id}`
          );
        }
      }
    }

    // Return warning if offensive
    if (isOffensive) {
      return res.json({
        post: updatedPost,
        warning:
          "Bình luận của bạn chứa ngôn từ không phù hợp. Vui lòng tôn trọng cộng đồng!",
      });
    }

    res.json({ post: updatedPost });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, taggedUsers } = req.body;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    if (content) post.content = content;
    if (taggedUsers !== undefined) {
      const taggedUsersArray =
        typeof taggedUsers === "string" ? JSON.parse(taggedUsers) : taggedUsers;
      post.taggedUsers = taggedUsersArray;

      // Send notifications to newly tagged users
      for (const userId of taggedUsersArray) {
        if (
          userId !== req.user._id.toString() &&
          !post.taggedUsers.includes(userId)
        ) {
          await createNotification(
            userId,
            req.user._id,
            "post_tag",
            `${req.user.name} đã gắn thẻ bạn trong một bài viết`,
            post._id,
            `/home?postId=${post._id}`
          );
        }
      }
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "name email avatar")
      .populate("comments.user", "name avatar")
      .populate("comments.replies.user", "name avatar")
      .populate("likes", "name avatar")
      .populate("shares.user", "name avatar")
      .populate("taggedUsers", "name avatar");

    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);

    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reply to a comment
export const replyToComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    console.log("Reply to comment:", {
      postId,
      commentId,
      content,
      hasFile: !!req.file,
    });

    // Handle image upload
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Extract mentioned users
    const mentionedUsers = extractMentions(content);

    const post = await Post.findById(postId);
    if (!post) {
      console.log("Post not found:", postId);
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      console.log("Comment not found:", commentId);
      return res.status(404).json({ message: "Comment not found" });
    }

    console.log("Adding reply to comment:", {
      commentId,
      userId: req.user._id,
    });

    comment.replies.push({
      user: req.user._id,
      content,
      image: imagePath,
      mentionedUsers,
    });

    await post.save();

    console.log("Reply saved successfully, fetching updated post...");

    const updatedPost = await Post.findById(postId)
      .populate("author", "name email avatar")
      .populate("taggedUsers", "name avatar")
      .populate("comments.user", "name avatar")
      .populate("comments.mentionedUsers", "name avatar")
      .populate("comments.replies.user", "name avatar")
      .populate("comments.replies.mentionedUsers", "name avatar")
      .populate("likes", "name avatar");

    console.log(
      "Updated post fetched, replies count:",
      updatedPost.comments.id(commentId)?.replies?.length
    );

    // Create notification for comment author
    if (comment.user.toString() !== req.user._id.toString()) {
      await createNotification(
        comment.user,
        req.user._id,
        "comment_reply",
        `${req.user.name} đã trả lời bình luận của bạn`,
        post._id,
        `/home?postId=${post._id}`
      );
    }

    // Send notifications to mentioned users
    if (mentionedUsers && mentionedUsers.length > 0) {
      for (const userId of mentionedUsers) {
        if (userId !== req.user._id.toString()) {
          await createNotification(
            userId,
            req.user._id,
            "reply_mention",
            `${req.user.name} đã nhắc đến bạn trong một trả lời`,
            post._id,
            `/home?postId=${post._id}`
          );
        }
      }
    }

    console.log("Reply completed successfully, sending response");
    res.json({ post: updatedPost });
  } catch (error) {
    console.error("Error replying to comment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Toggle like on comment
export const toggleCommentLike = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const likeIndex = comment.likes.indexOf(userId);
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId);

      // Create notification
      if (comment.user.toString() !== userId.toString()) {
        await createNotification(
          comment.user,
          userId,
          "comment_like",
          `${req.user.name} đã thích bình luận của bạn`,
          post._id,
          `/home?postId=${post._id}`
        );
      }
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "name email avatar")
      .populate("comments.user", "name avatar")
      .populate("comments.replies.user", "name avatar")
      .populate("likes", "name avatar");

    res.json({
      post: updatedPost,
      isLiked: likeIndex === -1,
      likesCount: comment.likes.length,
    });
  } catch (error) {
    console.error("Error toggling comment like:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle like on reply
export const toggleReplyLike = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    const likeIndex = reply.likes.indexOf(userId);
    if (likeIndex > -1) {
      reply.likes.splice(likeIndex, 1);
    } else {
      reply.likes.push(userId);

      // Create notification
      if (reply.user.toString() !== userId.toString()) {
        await createNotification(
          reply.user,
          userId,
          "reply_like",
          `${req.user.name} đã thích phản hồi của bạn`,
          post._id,
          `/home?postId=${post._id}`
        );
      }
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "name email avatar")
      .populate("comments.user", "name avatar")
      .populate("comments.replies.user", "name avatar")
      .populate("likes", "name avatar");

    res.json({
      post: updatedPost,
      isLiked: likeIndex === -1,
      likesCount: reply.likes.length,
    });
  } catch (error) {
    console.error("Error toggling reply like:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Share a post
export const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if already shared
    const alreadyShared = post.shares.some(
      (share) => share.user.toString() === userId.toString()
    );

    if (!alreadyShared) {
      post.shares.push({ user: userId });
      await post.save();

      // Create notification
      if (post.author.toString() !== userId.toString()) {
        await createNotification(
          post.author,
          userId,
          "post_share",
          `${req.user.name} đã chia sẻ bài viết của bạn`,
          post._id,
          `/home?postId=${post._id}`
        );
      }
    }

    const updatedPost = await Post.findById(postId)
      .populate("author", "name email avatar")
      .populate("comments.user", "name avatar")
      .populate("comments.replies.user", "name avatar")
      .populate("likes", "name avatar")
      .populate("shares.user", "name avatar");

    res.json({
      post: updatedPost,
      message: "Post shared successfully",
      sharesCount: post.shares.length,
    });
  } catch (error) {
    console.error("Error sharing post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get posts by group
export const getGroupPosts = async (req, res) => {
  try {
    const { groupId } = req.params;

    const posts = await Post.find({ group: groupId })
      .populate("author", "name email avatar")
      .populate("comments.user", "name avatar")
      .populate("comments.replies.user", "name avatar")
      .populate("likes", "name avatar")
      .populate("reactions.user", "name avatar")
      .populate("shares.user", "name avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching group posts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
