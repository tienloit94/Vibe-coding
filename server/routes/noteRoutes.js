import express from 'express';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotes);
router.post('/', upload.array('images', 5), createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
