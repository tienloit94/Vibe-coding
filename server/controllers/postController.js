import Post from '../models/Post.js';
import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';
import { containsOffensiveWords } from '../utils/contentModeration.js';
import { createNotification } from './notificationController.js';

// Create new post
export const createPost = async (req, res) => {
  try {
    const { content, visibility, taggedUsers } = req.body;

    // Handle uploaded images
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    // Parse taggedUsers if it's a string
    let taggedUsersArray = [];
    if (taggedUsers) {
      taggedUsersArray = typeof taggedUsers === 'string' ? JSON.parse(taggedUsers) : taggedUsers;
    }

    const post = await Post.create({
      author: req.user._id,
      content,
      images,
      taggedUsers: taggedUsersArray,
      visibility: visibility || 'friends',
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email avatar')
      .populate('taggedUsers', 'name avatar');
    
    // Send notifications to tagged users
    if (taggedUsersArray && taggedUsersArray.length > 0) {
      for (const userId of taggedUsersArray) {
        if (userId !== req.user._id.toString()) {
          await createNotification(
            userId,
            req.user._id,
            'post_tag',
            `${req.user.name} đã gắn thẻ bạn trong một bài viết`,
            post._id,
            `/home?postId=${post._id}`
          );
        }
      }
    }

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get news feed (posts from friends and own posts)
export const getNewsFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user's friends
    const friendRequests = await FriendRequest.find({
      $or: [
        { sender: req.user._id, status: 'accepted' },
        { receiver: req.user._id, status: 'accepted' },
      ],
    });

    const friendIds = friendRequests.map((fr) =>
      fr.sender.toString() === req.user._id.toString()
        ? fr.receiver
        : fr.sender
    );

    // Add own user ID
    const userIds = [...friendIds, req.user._id];

    // Get posts from friends and self
    const posts = await Post.find({
      author: { $in: userIds },
      visibility: { $in: ['public', 'friends'] },
    })
      .populate('author', 'name email avatar')
      .populate('comments.user', 'name avatar')
      .populate('likes', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({
      author: { $in: userIds },
      visibility: { $in: ['public', 'friends'] },
    });

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Error fetching news feed:', error);
    res.status(500).json({ message: 'Server error' });
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
      .populate('author', 'name email avatar')
      .populate('comments.user', 'name avatar')
      .populate('likes', 'name avatar')
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
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Like/Unlike post
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
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
      .populate('author', 'name email avatar')
      .populate('likes', 'name avatar');

    res.json(updatedPost);
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    // Check for offensive words
    const isOffensive = containsOffensiveWords(content);

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      content,
    });

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate('author', 'name email avatar')
      .populate('comments.user', 'name avatar')
      .populate('likes', 'name avatar');

    // Return warning if offensive
    if (isOffensive) {
      return res.json({ 
        post: updatedPost, 
        warning: 'Bình luận của bạn chứa ngôn từ không phù hợp. Vui lòng tôn trọng cộng đồng!' 
      });
    }

    res.json({ post: updatedPost });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, taggedUsers } = req.body;
    
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    if (content) post.content = content;
    if (taggedUsers !== undefined) {
      const taggedUsersArray = typeof taggedUsers === 'string' ? JSON.parse(taggedUsers) : taggedUsers;
      post.taggedUsers = taggedUsersArray;
      
      // Send notifications to newly tagged users
      for (const userId of taggedUsersArray) {
        if (userId !== req.user._id.toString() && !post.taggedUsers.includes(userId)) {
          await createNotification(
            userId,
            req.user._id,
            'post_tag',
            `${req.user.name} đã gắn thẻ bạn trong một bài viết`,
            post._id,
            `/home?postId=${post._id}`
          );
        }
      }
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate('author', 'name email avatar')
      .populate('comments.user', 'name avatar')
      .populate('likes', 'name avatar')
      .populate('taggedUsers', 'name avatar');

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(postId);

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
