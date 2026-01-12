import express from "express";
import {
  createStory,
  getStories,
  getMyStories,
  viewStory,
  deleteStory,
  addReaction,
  removeReaction,
  addReply,
  getReplies,
} from "../controllers/storyController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// All routes are private
router.use(protect);

// Story routes
router.post("/", upload.single("media"), createStory);
router.get("/", getStories);
router.get("/my-stories", getMyStories);
router.post("/:storyId/view", viewStory);
router.delete("/:storyId", deleteStory);

// Reaction routes
router.post("/:storyId/reaction", addReaction);
router.delete("/:storyId/reaction", removeReaction);

// Reply routes
router.post("/:storyId/reply", addReply);
router.get("/:storyId/replies", getReplies);

export default router;
