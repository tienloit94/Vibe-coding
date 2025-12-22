import User from '../models/User.js';

// Block user
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already blocked
    if (currentUser.blockedUsers.includes(userId)) {
      return res.status(400).json({ message: 'User already blocked' });
    }

    // Cannot block yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    currentUser.blockedUsers.push(userId);
    await currentUser.save();

    res.json({ message: 'User blocked successfully', blockedUsers: currentUser.blockedUsers });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      id => id.toString() !== userId
    );
    
    await currentUser.save();

    res.json({ message: 'User unblocked successfully', blockedUsers: currentUser.blockedUsers });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .populate('blockedUsers', 'name email avatar');

    res.json(currentUser.blockedUsers || []);
  } catch (error) {
    console.error('Error getting blocked users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is blocked
export const isUserBlocked = async (userId, currentUserId) => {
  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(userId);

  // Check if either user has blocked the other
  const isBlocked = 
    currentUser.blockedUsers.includes(userId) ||
    targetUser.blockedUsers.includes(currentUserId);

  return isBlocked;
};
