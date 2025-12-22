import FriendRequest from '../models/FriendRequest.js';
import User from '../models/User.js';

/**
 * @desc    Send friend request
 * @route   POST /api/friends/request/:userId
 * @access  Private
 */
export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if trying to add self
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself',
      });
    }

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already friends
    if (req.user.friends.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already friends with this user',
      });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already exists',
      });
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      sender: req.user._id,
      receiver: userId,
    });

    await friendRequest.populate('sender', 'name email avatar');
    await friendRequest.populate('receiver', 'name email avatar');

    // Emit socket event to receiver
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    if (io && connectedUsers) {
      const receiverSocketId = connectedUsers.get(userId);
      console.log('🔔 Sending friend request notification to:', userId, 'socketId:', receiverSocketId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('friend-request-received', {
          sender: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
          },
          timestamp: new Date(),
        });
        console.log('✅ Friend request notification sent');
      } else {
        console.log('⚠️ Receiver is offline');
      }
    }

    res.status(201).json({
      success: true,
      message: 'Friend request sent',
      friendRequest,
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send friend request',
      error: error.message,
    });
  }
};

/**
 * @desc    Get pending friend requests
 * @route   GET /api/friends/requests
 * @access  Private
 */
export const getFriendRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: 'pending',
    })
      .populate('sender', 'name email avatar isOnline')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get friend requests',
      error: error.message,
    });
  }
};

/**
 * @desc    Accept friend request
 * @route   PUT /api/friends/accept/:requestId
 * @access  Private
 */
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found',
      });
    }

    // Check if request is for current user
    if (friendRequest.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Update request status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Add to friends list for both users
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.receiver },
    });

    await User.findByIdAndUpdate(friendRequest.receiver, {
      $addToSet: { friends: friendRequest.sender },
    });

    await friendRequest.populate('sender', 'name email avatar isOnline');
    await friendRequest.populate('receiver', 'name email avatar isOnline');

    // Emit socket event to sender
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    if (io && connectedUsers) {
      const senderSocketId = connectedUsers.get(friendRequest.sender._id.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit('friend-request-accepted-notification', {
          accepter: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
          },
          timestamp: new Date(),
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Friend request accepted',
      friendRequest,
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept friend request',
      error: error.message,
    });
  }
};

/**
 * @desc    Reject friend request
 * @route   PUT /api/friends/reject/:requestId
 * @access  Private
 */
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found',
      });
    }

    // Check if request is for current user
    if (friendRequest.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.status(200).json({
      success: true,
      message: 'Friend request rejected',
    });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject friend request',
      error: error.message,
    });
  }
};

/**
 * @desc    Get friends list
 * @route   GET /api/friends
 * @access  Private
 */
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'friends',
      'name email avatar isOnline lastSeen'
    );

    res.status(200).json({
      success: true,
      count: user.friends.length,
      friends: user.friends,
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get friends',
      error: error.message,
    });
  }
};

/**
 * @desc    Search users
 * @route   GET /api/friends/search?q=query
 * @access  Private
 */
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const users = await User.find({
      _id: { $ne: req.user._id }, // Exclude current user
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    })
      .select('name email avatar isOnline')
      .limit(20);

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error.message,
    });
  }
};
