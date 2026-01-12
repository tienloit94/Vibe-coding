import express from "express";
import {
  getMessages,
  sendMessage,
  getConversations,
  markAsRead,
  addReaction,
  removeReaction,
} from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";
import { validate, messageSchema } from "../validators/index.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// All routes are private
router.use(protect);

router.get("/conversations", getConversations);
router.get("/:userId", getMessages);
router.post("/:userId", upload.single("file"), sendMessage);
router.put("/read/:userId", markAsRead);
router.post("/:messageId/reactions", addReaction);
router.delete("/:messageId/reactions", removeReaction);

export default router;
