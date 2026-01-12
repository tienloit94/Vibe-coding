import express from "express";
import {
  createGroup,
  getGroups,
  getGroup,
  addMembers,
  leaveGroup,
  discoverGroups,
  getMyGroups,
  joinGroup,
  inviteToGroup,
  acceptGroupInvitation,
  declineGroupInvitation,
  getGroupInvitations,
  updateGroup,
  removeMember,
  promoteModerator,
  demoteModerator,
  banMember,
  unbanMember,
  approveMember,
  rejectMember,
  deleteGroup,
  transferAdmin,
} from "../controllers/groupController.js";
import {
  sendGroupMessage,
  getGroupMessages,
} from "../controllers/groupMessageController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// All routes are private
router.use(protect);

// Discovery and user groups
router.get("/discover", discoverGroups);
router.get("/my-groups", getMyGroups);
router.get("/invitations", getGroupInvitations);

// Group CRUD
router.post(
  "/",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  createGroup
);
router.get("/", getGroups);
router.get("/:groupId", getGroup);
router.put(
  "/:groupId",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateGroup
);
router.delete("/:groupId", deleteGroup);
router.post("/:groupId/join", joinGroup);
router.post("/:groupId/invite", inviteToGroup);
router.post("/:groupId/accept-invitation", acceptGroupInvitation);
router.post("/:groupId/decline-invitation", declineGroupInvitation);
router.post("/:groupId/members", addMembers);
router.delete("/:groupId/members/:userId", removeMember);
router.post("/:groupId/moderators/:userId", promoteModerator);
router.delete("/:groupId/moderators/:userId", demoteModerator);
router.post("/:groupId/transfer-admin/:userId", transferAdmin);
router.post("/:groupId/ban/:userId", banMember);
router.delete("/:groupId/ban/:userId", unbanMember);
router.post("/:groupId/approve/:userId", approveMember);
router.delete("/:groupId/approve/:userId", rejectMember);
router.delete("/:groupId/leave", leaveGroup);

// Group messages
router.post("/:groupId/messages", sendGroupMessage);
router.get("/:groupId/messages", getGroupMessages);

export default router;
