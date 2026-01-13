import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resetPasswordWithToken,
  verifyResetToken,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate, registerSchema, loginSchema } from "../validators/index.js";

const router = express.Router();

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.post("/reset-password-token", resetPasswordWithToken);
router.get("/verify-reset-token/:token", verifyResetToken);

// Private routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

export default router;
