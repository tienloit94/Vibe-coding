import express from "express";
import {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  searchUsers,
  removeFriend,
} from "../controllers/friendController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are private
router.use(protect);

router.get("/search", searchUsers);
router.get("/search-for-mention", async (req, res) => {
  try {
    const query = req.query.q || "";
    const limit = parseInt(req.query.limit) || 10;

    const User = (await import("../models/User.js")).default;

    // Get user with populated friends
    const user = await User.findById(req.user._id).populate(
      "friends",
      "_id name avatar"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter friends by name
    const friends = user.friends
      .filter((friend) =>
        friend.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit);

    console.log("Search for mention:", { query, friendsCount: friends.length });

    res.json({ friends });
  } catch (error) {
    console.error("Error searching friends for mention:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/requests", getFriendRequests);
router.get("/", getFriends);
router.post("/request/:userId", sendFriendRequest);
router.put("/accept/:requestId", acceptFriendRequest);
router.put("/reject/:requestId", rejectFriendRequest);
router.delete("/:friendId", removeFriend);

export default router;
