import express from "express";
import {
  createProduct,
  getAllProducts,
  getProduct,
  getUserProducts,
  updateProduct,
  deleteProduct,
  toggleLikeProduct,
  getFeaturedProducts,
} from "../controllers/productController.js";
import {
  getSavedProducts,
  saveProduct,
  unsaveProduct,
  checkSavedStatus,
} from "../controllers/savedProductController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);

// Protected routes
router.use(protect);

router.post("/", upload.array("images", 5), createProduct);
router.get("/saved", getSavedProducts);
router.get("/user/:userId", getUserProducts);
router.get("/:id", getProduct);
router.put("/:id", upload.array("images", 5), updateProduct);
router.delete("/:id", deleteProduct);
router.post("/:id/like", toggleLikeProduct);
router.post("/:productId/save", saveProduct);
router.delete("/:productId/save", unsaveProduct);
router.get("/:productId/saved-status", checkSavedStatus);

export default router;
