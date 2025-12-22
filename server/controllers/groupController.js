import Group from '../models/Group.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

/**
 * @desc    Create group
 * @route   POST /api/groups
 * @access  Private
 */
export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    // Validate members are friends
    const user = await User.findById(req.user._id);
    const invalidMembers = members.filter(
      (memberId) => !user.friends.includes(memberId)
    );

    if (invalidMembers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Can only add friends to group',
      });
    }

    // Create group with admin and members
    const group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id, ...members],
    });

    await group.populate('admin', 'name email avatar');
    await group.populate('members', 'name email avatar isOnline');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group,
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's groups
 * @route   GET /api/groups
 * @access  Private
 */
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user._id,
    })
      .populate('admin', 'name email avatar')
      .populate('members', 'name email avatar isOnline')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      groups,
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get groups',
      error: error.message,
    });
  }
};

/**
 * @desc    Get group by ID
 * @route   GET /api/groups/:groupId
 * @access  Private
 */
export const getGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('admin', 'name email avatar')
      .populate('members', 'name email avatar isOnline');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if user is member
    if (!group.members.some((m) => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this group',
      });
    }

    res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get group',
      error: error.message,
    });
  }
};

/**
 * @desc    Add members to group
 * @route   POST /api/groups/:groupId/members
 * @access  Private
 */
export const addMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only admin can add members',
      });
    }

    // Validate members are friends
    const user = await User.findById(req.user._id);
    const invalidMembers = members.filter(
      (memberId) => !user.friends.includes(memberId)
    );

    if (invalidMembers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Can only add friends to group',
      });
    }

    // Add members
    group.members = [...new Set([...group.members, ...members])];
    await group.save();

    await group.populate('admin', 'name email avatar');
    await group.populate('members', 'name email avatar isOnline');

    res.status(200).json({
      success: true,
      message: 'Members added successfully',
      group,
    });
  } catch (error) {
    console.error('Add members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add members',
      error: error.message,
    });
  }
};

/**
 * @desc    Leave group
 * @route   DELETE /api/groups/:groupId/leave
 * @access  Private
 */
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if user is member
    if (!group.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Not a member of this group',
      });
    }

    // If admin leaves, assign new admin or delete group
    if (group.admin.toString() === req.user._id.toString()) {
      if (group.members.length === 1) {
        // Last member, delete group
        await group.deleteOne();
        return res.status(200).json({
          success: true,
          message: 'Group deleted',
        });
      } else {
        // Assign first member as new admin
        const newAdmin = group.members.find(
          (m) => m.toString() !== req.user._id.toString()
        );
        group.admin = newAdmin;
      }
    }

    // Remove member
    group.members = group.members.filter(
      (m) => m.toString() !== req.user._id.toString()
    );
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Left group successfully',
    });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave group',
      error: error.message,
    });
  }
};
