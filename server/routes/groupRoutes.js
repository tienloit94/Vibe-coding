import express from 'express';
import {
  createGroup,
  getGroups,
  getGroup,
  addMembers,
  leaveGroup,
} from '../controllers/groupController.js';
import {
  sendGroupMessage,
  getGroupMessages,
} from '../controllers/groupMessageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are private
router.use(protect);

router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:groupId', getGroup);
router.post('/:groupId/members', addMembers);
router.delete('/:groupId/leave', leaveGroup);

// Group messages
router.post('/:groupId/messages', sendGroupMessage);
router.get('/:groupId/messages', getGroupMessages);

export default router;
