import express from 'express';
import { blockUser, unblockUser, getBlockedUsers } from '../controllers/blockController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/block/:userId', blockUser);
router.delete('/unblock/:userId', unblockUser);
router.get('/blocked', getBlockedUsers);

export default router;
