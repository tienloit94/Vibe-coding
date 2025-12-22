import express from 'express';
import { updateAIKey, checkAIKey } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/set-key', updateAIKey);
router.get('/check-key', checkAIKey);

export default router;
