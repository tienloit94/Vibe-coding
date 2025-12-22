import Message from '../models/Message.js';
import User from '../models/User.js';
import { isUserBlocked } from './blockController.js';

/**
 * @desc    Get conversation with a user (with pagination)
 * @route   GET /api/messages/:userId?page=1&limit=50
 * @access  Private
 */
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get total count
    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    });

    // Get paginated conversation
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'name avatar isOnline')
      .populate('receiver', 'name avatar isOnline')
      .sort({ createdAt: -1 }) // Newest first for pagination
      .skip(skip)
      .limit(limit);

    // Reverse to show oldest first in chat
    const reversedMessages = messages.reverse();

    // Mark messages from other user as read
    await Message.markAsRead(userId, req.user._id);

    res.status(200).json({
      success: true,
      messages: reversedMessages,
      pagination: {
        total: totalMessages,
        page,
        limit,
        pages: Math.ceil(totalMessages / limit),
        hasMore: page < Math.ceil(totalMessages / limit),
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message,
    });
  }
};

/**
 * @desc    Send message to a user
 * @route   POST /api/messages/:userId
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    const file = req.file;

    // Verify the receiver exists
    const receiver = await User.findById(userId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
    }

    // Check if blocked
    const blocked = await isUserBlocked(userId, req.user._id);
    if (blocked) {
      return res.status(403).json({
        success: false,
        message: 'Cannot send message. User is blocked or you are blocked.',
      });
    }

    // Determine message type based on file
    let messageType = 'text';
    let fileUrl = null;
    let fileName = null;
    let fileSize = null;

    if (file) {
      fileName = file.originalname;
      fileSize = file.size;
      fileUrl = `/uploads/${file.filename}`;

      // Determine message type from mimetype
      if (file.mimetype.startsWith('image/')) {
        messageType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        messageType = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        messageType = 'audio';
      } else {
        messageType = 'file';
      }
    }

    // Create message
    const message = await Message.create({
      sender: req.user._id,
      receiver: userId,
      content: content || '',
      messageType,
      fileUrl,
      fileName,
      fileSize,
    });

    // Populate sender and receiver info
    await message.populate('sender', 'name avatar isOnline');
    await message.populate('receiver', 'name avatar isOnline');

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/messages/conversations
 * @access  Private
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name avatar isOnline')
      .populate('receiver', 'name avatar isOnline')
      .sort({ createdAt: -1 });

    // Group by conversation partner and get latest message
    const conversationMap = new Map();

    messages.forEach((msg) => {
      const partnerId =
        msg.sender._id.toString() === userId.toString()
          ? msg.receiver._id.toString()
          : msg.sender._id.toString();

      if (!conversationMap.has(partnerId)) {
        const partner =
          msg.sender._id.toString() === userId.toString()
            ? msg.receiver
            : msg.sender;

        conversationMap.set(partnerId, {
          user: partner,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // Count unread messages
      if (
        msg.receiver._id.toString() === userId.toString() &&
        !msg.isRead
      ) {
        conversationMap.get(partnerId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationMap.values());

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark messages as read
 * @route   PUT /api/messages/read/:userId
 * @access  Private
 */
export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params; // The sender of messages to mark as read
    const receiverId = req.user._id; // Current user (receiver)

    const result = await Message.updateMany(
      {
        sender: userId,
        receiver: receiverId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message,
    });
  }
};

/**
 * @desc    Add reaction to a message
 * @route   POST /api/messages/:messageId/reactions
 * @access  Private
 */
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required',
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      (r) => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction if already exists
      message.reactions = message.reactions.filter(
        (r) => r.user.toString() !== req.user._id.toString() || r.emoji !== emoji
      );
    } else {
      // Remove any other reaction from this user and add new one
      message.reactions = message.reactions.filter(
        (r) => r.user.toString() !== req.user._id.toString()
      );
      message.reactions.push({
        user: req.user._id,
        emoji,
        createdAt: new Date(),
      });
    }

    await message.save();
    await message.populate('sender', 'name avatar isOnline');
    await message.populate('receiver', 'name avatar isOnline');

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error.message,
    });
  }
};

/**
 * @desc    Remove reaction from a message
 * @route   DELETE /api/messages/:messageId/reactions
 * @access  Private
 */
export const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Remove all reactions from this user
    message.reactions = message.reactions.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );

    await message.save();
    await message.populate('sender', 'name avatar isOnline');
    await message.populate('receiver', 'name avatar isOnline');

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction',
      error: error.message,
    });
  }
};

