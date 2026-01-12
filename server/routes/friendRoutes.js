import express from "express";
import {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  searchUsers,
} from "../controllers/friendController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are private
router.use(protect);

router.get("/search", searchUsers);
router.get("/requests", getFriendRequests);
router.get("/", getFriends);
router.post("/request/:userId", sendFriendRequest);
router.put("/accept/:requestId", acceptFriendRequest);
router.put("/reject/:requestId", rejectFriendRequest);

export default router;
