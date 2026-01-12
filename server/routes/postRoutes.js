import express from "express";
import {
  createPost,
  getNewsFeed,
  getUserPosts,
  toggleLike,
  addReaction,
  removeReaction,
  addComment,
  updatePost,
  deletePost,
  replyToComment,
  toggleCommentLike,
  toggleReplyLike,
  sharePost,
  getGroupPosts,
} from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Handle both images and video uploads
const uploadFields = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "video", maxCount: 1 },
]);

router.post(
  "/",
  (req, res, next) => {
    uploadFields(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      // Flatten files array for easier processing
      if (req.files) {
        const allFiles = [];
        if (req.files.images) allFiles.push(...req.files.images);
        if (req.files.video) allFiles.push(...req.files.video);
        req.files = allFiles;
      }
      next();
    });
  },
  createPost
);

router.get("/feed", getNewsFeed);
router.get("/user/:userId", getUserPosts);
router.get("/group/:groupId", getGroupPosts);
router.post("/:postId/like", toggleLike);
router.post("/:postId/reaction", addReaction);
router.delete("/:postId/reaction", removeReaction);
router.post("/:postId/comment", addComment);
router.post(
  "/:postId/comment/:commentId/reply",
  upload.single("image"),
  replyToComment
);
router.post("/:postId/comment/:commentId/like", toggleCommentLike);
router.post("/:postId/comment/:commentId/reply/:replyId/like", toggleReplyLike);
router.post("/:postId/share", sharePost);
router.put("/:postId", updatePost);
router.delete("/:postId", deletePost);

export default router;
