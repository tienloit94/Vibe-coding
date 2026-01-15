import Group from "../models/Group.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

/**
 * @desc    Create group
 * @route   POST /api/groups
 * @access  Private
 */
export const createGroup = async (req, res) => {
  try {
    const {
      name,
      description,
      members,
      privacy,
      category,
      tags,
      memberApprovalRequired,
    } = req.body;

    // Parse tags if it's a string
    let parsedTags = tags;
    if (typeof tags === "string") {
      parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
    }

    // Prepare group data
    const groupData = {
      name,
      description,
      admin: req.user._id,
      members: members ? [req.user._id, ...members] : [req.user._id],
      privacy: privacy || "public",
      type: "social",
      category,
      tags: parsedTags || [],
      memberApprovalRequired:
        memberApprovalRequired === "true" || memberApprovalRequired === true,
    };

    // Handle file uploads from Cloudinary
    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        groupData.avatar = req.files.avatar[0].path; // Cloudinary URL
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        groupData.coverImage = req.files.coverImage[0].path; // Cloudinary URL
      }
    }

    // Create group
    const group = await Group.create(groupData);

    await group.populate("admin", "name email avatar");
    await group.populate("members", "name email avatar isOnline");

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create group",
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
      .populate("admin", "name email avatar")
      .populate("members", "name email avatar isOnline")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      groups,
    });
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get groups",
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
      .populate("admin", "name email avatar")
      .populate("members", "name email avatar isOnline")
      .populate("moderators", "name email avatar")
      .populate("pendingMembers.user", "name email avatar")
      .populate("bannedMembers.user", "name email avatar");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is member
    if (
      !group.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Not a member of this group",
      });
    }

    res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    console.error("Get group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get group",
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
        message: "Group not found",
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only admin can add members",
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
        message: "Can only add friends to group",
      });
    }

    // Add members
    group.members = [...new Set([...group.members, ...members])];
    await group.save();

    await group.populate("admin", "name email avatar");
    await group.populate("members", "name email avatar isOnline");

    res.status(200).json({
      success: true,
      message: "Members added successfully",
      group,
    });
  } catch (error) {
    console.error("Add members error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add members",
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
        message: "Group not found",
      });
    }

    // Check if user is member
    if (!group.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "Not a member of this group",
      });
    }

    // If admin leaves, assign new admin or delete group
    if (group.admin.toString() === req.user._id.toString()) {
      if (group.members.length === 1) {
        // Last member, delete group
        await group.deleteOne();
        return res.status(200).json({
          success: true,
          message: "Group deleted",
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
      message: "Left group successfully",
    });
  } catch (error) {
    console.error("Leave group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to leave group",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all public groups for discovery
 * @route   GET /api/groups/discover
 * @access  Private
 */
export const discoverGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      privacy: { $in: ["public", "private"] },
      members: { $ne: req.user._id }, // Not already a member
      type: "social", // Only social groups
    })
      .populate("admin", "name email avatar")
      .populate("members", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: groups.length,
      groups,
    });
  } catch (error) {
    console.error("Discover groups error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to discover groups",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's own groups
 * @route   GET /api/groups/my-groups
 * @access  Private
 */
export const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user._id,
      type: "social", // Only social groups
    })
      .populate("admin", "name email avatar")
      .populate("members", "name email avatar")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      groups,
    });
  } catch (error) {
    console.error("Get my groups error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get groups",
      error: error.message,
    });
  }
};

/**
 * @desc    Join a group
 * @route   POST /api/groups/:groupId/join
 * @access  Private
 */
export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if already a member
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "Already a member of this group",
      });
    }

    // If private group, add to pending members
    if (group.privacy === "private" || group.memberApprovalRequired) {
      if (
        !group.pendingMembers.some(
          (pm) => pm.user.toString() === req.user._id.toString()
        )
      ) {
        group.pendingMembers.push({
          user: req.user._id,
          requestedAt: new Date(),
        });
        await group.save();
      }

      return res.status(200).json({
        success: true,
        message: "Join request sent. Waiting for approval.",
      });
    }

    // For public groups, add directly
    group.members.push(req.user._id);
    await group.save();

    await group.populate("admin", "name email avatar");
    await group.populate("members", "name email avatar");

    res.status(200).json({
      success: true,
      message: "Joined group successfully",
      group,
    });
  } catch (error) {
    console.error("Join group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join group",
      error: error.message,
    });
  }
};

/**
 * @desc    Invite friends to group
 * @route   POST /api/groups/:groupId/invite
 * @access  Private
 */
export const inviteToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userIds } = req.body; // Array of user IDs to invite

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide user IDs to invite",
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin or moderator
    const isAdmin = group.admin.toString() === req.user._id.toString();
    const isModerator = group.moderators?.some(
      (mod) => mod.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isModerator) {
      return res.status(403).json({
        success: false,
        message: "Only admin and moderators can invite members",
      });
    }

    const invitedUsers = [];
    const alreadyMembers = [];
    const alreadyInvited = [];

    for (const userId of userIds) {
      // Check if already a member
      if (group.members.some((m) => m.toString() === userId)) {
        alreadyMembers.push(userId);
        continue;
      }

      // Check if already invited
      if (group.invitations?.some((inv) => inv.user.toString() === userId)) {
        alreadyInvited.push(userId);
        continue;
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        continue;
      }

      // Add invitation
      group.invitations.push({
        user: userId,
        invitedBy: req.user._id,
        invitedAt: new Date(),
      });

      invitedUsers.push(userId);

      // TODO: Send notification to invited user
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: `Invited ${invitedUsers.length} user(s) successfully`,
      invitedCount: invitedUsers.length,
      alreadyMembers: alreadyMembers.length,
      alreadyInvited: alreadyInvited.length,
    });
  } catch (error) {
    console.error("Invite to group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to invite users",
      error: error.message,
    });
  }
};

/**
 * @desc    Accept group invitation
 * @route   POST /api/groups/:groupId/accept-invitation
 * @access  Private
 */
export const acceptGroupInvitation = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Find invitation
    const invitationIndex = group.invitations.findIndex(
      (inv) => inv.user.toString() === req.user._id.toString()
    );

    if (invitationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "No invitation found",
      });
    }

    // Check if already a member
    if (group.members.includes(req.user._id)) {
      // Remove invitation
      group.invitations.splice(invitationIndex, 1);
      await group.save();

      return res.status(400).json({
        success: false,
        message: "Already a member of this group",
      });
    }

    // Add to members and remove invitation
    group.members.push(req.user._id);
    group.invitations.splice(invitationIndex, 1);
    await group.save();

    await group.populate("admin", "name email avatar");
    await group.populate("members", "name email avatar");

    res.status(200).json({
      success: true,
      message: "Joined group successfully",
      group,
    });
  } catch (error) {
    console.error("Accept group invitation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept invitation",
      error: error.message,
    });
  }
};

/**
 * @desc    Decline group invitation
 * @route   POST /api/groups/:groupId/decline-invitation
 * @access  Private
 */
export const declineGroupInvitation = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Find and remove invitation
    const invitationIndex = group.invitations.findIndex(
      (inv) => inv.user.toString() === req.user._id.toString()
    );

    if (invitationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "No invitation found",
      });
    }

    group.invitations.splice(invitationIndex, 1);
    await group.save();

    res.status(200).json({
      success: true,
      message: "Invitation declined",
    });
  } catch (error) {
    console.error("Decline group invitation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to decline invitation",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's group invitations
 * @route   GET /api/groups/invitations
 * @access  Private
 */
export const getGroupInvitations = async (req, res) => {
  try {
    const groups = await Group.find({
      "invitations.user": req.user._id,
    })
      .populate("admin", "name email avatar")
      .populate("invitations.invitedBy", "name email avatar")
      .select(
        "name description avatar coverImage privacy category invitations"
      );

    // Filter to only include user's invitations
    const invitations = groups.map((group) => {
      const userInvitation = group.invitations.find(
        (inv) => inv.user.toString() === req.user._id.toString()
      );

      return {
        _id: group._id,
        name: group.name,
        description: group.description,
        avatar: group.avatar,
        coverImage: group.coverImage,
        privacy: group.privacy,
        category: group.category,
        admin: group.admin,
        invitedBy: userInvitation?.invitedBy,
        invitedAt: userInvitation?.invitedAt,
      };
    });

    res.status(200).json({
      success: true,
      count: invitations.length,
      invitations,
    });
  } catch (error) {
    console.error("Get group invitations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get invitations",
      error: error.message,
    });
  }
};

/**
 * @desc    Update group info
 * @route   PUT /api/groups/:groupId
 * @access  Private (Admin only)
 */
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const {
      name,
      description,
      privacy,
      category,
      tags,
      memberApprovalRequired,
      postsEnabled,
    } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only admin can update group",
      });
    }

    // Update fields
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (privacy) group.privacy = privacy;
    if (category) group.category = category;
    if (tags) {
      group.tags =
        typeof tags === "string"
          ? tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t)
          : tags;
    }
    if (memberApprovalRequired !== undefined) {
      group.memberApprovalRequired = memberApprovalRequired;
    }
    if (postsEnabled !== undefined) {
      group.postsEnabled = postsEnabled;
    }

    // Handle file uploads from Cloudinary
    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        group.avatar = req.files.avatar[0].path; // Cloudinary URL
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        group.coverImage = req.files.coverImage[0].path; // Cloudinary URL
      }
    }

    await group.save();
    await group.populate("admin", "name email avatar");
    await group.populate("members", "name email avatar");

    res.status(200).json({
      success: true,
      message: "Group updated successfully",
      group,
    });
  } catch (error) {
    console.error("Update group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update group",
      error: error.message,
    });
  }
};

/**
 * @desc    Remove member from group
 * @route   DELETE /api/groups/:groupId/members/:userId
 * @access  Private (Admin/Moderator)
 */
export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin or moderator
    const isAdmin = group.admin.toString() === req.user._id.toString();
    const isModerator = group.moderators?.some(
      (mod) => mod.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isModerator) {
      return res.status(403).json({
        success: false,
        message: "Only admin and moderators can remove members",
      });
    }

    // Cannot remove admin
    if (userId === group.admin.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove group admin",
      });
    }

    // Remove member
    group.members = group.members.filter((m) => m.toString() !== userId);
    await group.save();

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove member",
      error: error.message,
    });
  }
};

/**
 * @desc    Promote member to moderator
 * @route   POST /api/groups/:groupId/moderators/:userId
 * @access  Private (Admin only)
 */
export const promoteModerator = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only admin can promote moderators",
      });
    }

    // Check if user is a member
    if (!group.members.some((m) => m.toString() === userId)) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this group",
      });
    }

    // Check if already a moderator
    if (group.moderators?.some((m) => m.toString() === userId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a moderator",
      });
    }

    // Add to moderators
    if (!group.moderators) group.moderators = [];
    group.moderators.push(userId);
    await group.save();

    res.status(200).json({
      success: true,
      message: "User promoted to moderator",
    });
  } catch (error) {
    console.error("Promote moderator error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to promote moderator",
      error: error.message,
    });
  }
};

/**
 * @desc    Demote moderator
 * @route   DELETE /api/groups/:groupId/moderators/:userId
 * @access  Private (Admin only)
 */
export const demoteModerator = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only admin can demote moderators",
      });
    }

    // Remove from moderators
    group.moderators =
      group.moderators?.filter((m) => m.toString() !== userId) || [];
    await group.save();

    res.status(200).json({
      success: true,
      message: "Moderator demoted",
    });
  } catch (error) {
    console.error("Demote moderator error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to demote moderator",
      error: error.message,
    });
  }
};

/**
 * @desc    Ban member from group
 * @route   POST /api/groups/:groupId/ban/:userId
 * @access  Private (Admin/Moderator)
 */
export const banMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const { reason } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin or moderator
    const isAdmin = group.admin.toString() === req.user._id.toString();
    const isModerator = group.moderators?.some(
      (mod) => mod.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isModerator) {
      return res.status(403).json({
        success: false,
        message: "Only admin and moderators can ban members",
      });
    }

    // Cannot ban admin
    if (userId === group.admin.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot ban group admin",
      });
    }

    // Remove from members if present
    group.members = group.members.filter((m) => m.toString() !== userId);

    // Add to banned list
    const alreadyBanned = group.bannedMembers?.some(
      (b) => b.user.toString() === userId
    );

    if (!alreadyBanned) {
      if (!group.bannedMembers) group.bannedMembers = [];
      group.bannedMembers.push({
        user: userId,
        bannedAt: new Date(),
        reason: reason || "No reason provided",
      });
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: "Member banned successfully",
    });
  } catch (error) {
    console.error("Ban member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to ban member",
      error: error.message,
    });
  }
};

/**
 * @desc    Unban member from group
 * @route   DELETE /api/groups/:groupId/ban/:userId
 * @access  Private (Admin/Moderator)
 */
export const unbanMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin or moderator
    const isAdmin = group.admin.toString() === req.user._id.toString();
    const isModerator = group.moderators?.some(
      (mod) => mod.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isModerator) {
      return res.status(403).json({
        success: false,
        message: "Only admin and moderators can unban members",
      });
    }

    // Remove from banned list
    group.bannedMembers =
      group.bannedMembers?.filter((b) => b.user.toString() !== userId) || [];

    await group.save();

    res.status(200).json({
      success: true,
      message: "Member unbanned successfully",
    });
  } catch (error) {
    console.error("Unban member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unban member",
      error: error.message,
    });
  }
};

/**
 * @desc    Approve pending member
 * @route   POST /api/groups/:groupId/approve/:userId
 * @access  Private (Admin/Moderator)
 */
export const approveMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin or moderator
    const isAdmin = group.admin.toString() === req.user._id.toString();
    const isModerator = group.moderators?.some(
      (mod) => mod.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isModerator) {
      return res.status(403).json({
        success: false,
        message: "Only admin and moderators can approve members",
      });
    }

    // Find pending member
    const pendingIndex = group.pendingMembers?.findIndex(
      (pm) => pm.user.toString() === userId
    );

    if (pendingIndex === -1 || pendingIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: "Pending request not found",
      });
    }

    // Add to members and remove from pending
    group.members.push(userId);
    group.pendingMembers.splice(pendingIndex, 1);
    await group.save();

    res.status(200).json({
      success: true,
      message: "Member approved successfully",
    });
  } catch (error) {
    console.error("Approve member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve member",
      error: error.message,
    });
  }
};

/**
 * @desc    Reject pending member
 * @route   DELETE /api/groups/:groupId/approve/:userId
 * @access  Private (Admin/Moderator)
 */
export const rejectMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin or moderator
    const isAdmin = group.admin.toString() === req.user._id.toString();
    const isModerator = group.moderators?.some(
      (mod) => mod.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isModerator) {
      return res.status(403).json({
        success: false,
        message: "Only admin and moderators can reject members",
      });
    }

    // Remove from pending
    group.pendingMembers =
      group.pendingMembers?.filter((pm) => pm.user.toString() !== userId) || [];

    await group.save();

    res.status(200).json({
      success: true,
      message: "Request rejected",
    });
  } catch (error) {
    console.error("Reject member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject member",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete group
 * @route   DELETE /api/groups/:groupId
 * @access  Private (Admin only)
 */
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete group",
      });
    }

    await group.deleteOne();

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Delete group error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete group",
      error: error.message,
    });
  }
};

/**
 * @desc    Transfer admin role to another member
 * @route   POST /api/groups/:groupId/transfer-admin/:userId
 * @access  Private (Admin only)
 */
export const transferAdmin = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is current admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only admin can transfer admin role",
      });
    }

    // Check if target user is a member
    if (!group.members.some((m) => m.toString() === userId)) {
      return res.status(400).json({
        success: false,
        message: "Target user must be a member of the group",
      });
    }

    // Cannot transfer to yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot transfer admin role to yourself",
      });
    }

    // Transfer admin role
    const oldAdminId = group.admin;
    group.admin = userId;

    // Make old admin a moderator if not already
    if (!group.moderators.some((m) => m.toString() === oldAdminId.toString())) {
      group.moderators.push(oldAdminId);
    }

    // Remove new admin from moderators if they were one
    group.moderators = group.moderators.filter((m) => m.toString() !== userId);

    await group.save();

    await group.populate("admin", "name email avatar");
    await group.populate("members", "name email avatar");
    await group.populate("moderators", "name email avatar");

    res.status(200).json({
      success: true,
      message: "Admin role transferred successfully",
      group,
    });
  } catch (error) {
    console.error("Transfer admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to transfer admin role",
      error: error.message,
    });
  }
};
