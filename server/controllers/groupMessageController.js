import GroupMessage from '../models/GroupMessage.js';
import Group from '../models/Group.js';
import { connectedUsers } from '../config/socket.js';

export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, messageType, fileUrl, fileName } = req.body;

    // Check if user is member of group
    const group = await Group.findById(groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(member => member._id.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const message = await GroupMessage.create({
      group: groupId,
      sender: req.user._id,
      content,
      messageType: messageType || 'text',
      fileUrl,
      fileName,
    });

    const populatedMessage = await GroupMessage.findById(message._id)
      .populate('sender', 'name email avatar');

    // Emit to all group members
    group.members.forEach(member => {
      const memberId = member._id.toString();
      if (memberId !== req.user._id.toString()) {
        const memberSocketId = connectedUsers.get(memberId);
        if (memberSocketId && global.io) {
          global.io.to(memberSocketId).emit('group-message-received', {
            groupId: groupId,
            message: populatedMessage,
          });
        }
      }
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending group message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user is member of group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(member => member.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const messages = await GroupMessage.find({ group: groupId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching group messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
