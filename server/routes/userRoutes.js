import express from 'express';
import { getAllUsers, getUserById, searchUsers, getUserProfile, updateProfile, uploadAvatar } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All routes are private
router.use(protect);

router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.get('/profile/:userId', getUserProfile);
router.put('/profile', upload.single('avatar'), updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.get('/:id', getUserById);

export default router;
