import express from 'express';
import {
  createPost,
  getNewsFeed,
  getUserPosts,
  toggleLike,
  addComment,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', upload.array('images', 5), createPost);
router.get('/feed', getNewsFeed);
router.get('/user/:userId', getUserPosts);
router.post('/:postId/like', toggleLike);
router.post('/:postId/comment', addComment);
router.put('/:postId', updatePost);
router.delete('/:postId', deletePost);

export default router;
