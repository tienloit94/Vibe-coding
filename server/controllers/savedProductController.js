import SavedProduct from "../models/SavedProduct.js";
import Product from "../models/Product.js";

/**
 * @desc    Get user's saved products
 * @route   GET /api/products/saved
 * @access  Private
 */
export const getSavedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const savedProducts = await SavedProduct.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "product",
        populate: {
          path: "seller",
          select: "name email avatar",
        },
      });

    const total = await SavedProduct.countDocuments({ user: req.user._id });

    res.status(200).json({
      products: savedProducts
        .map((saved) => ({
          ...saved.product.toObject(),
          savedNotes: saved.notes,
          savedAt: saved.createdAt,
        }))
        .filter((product) => product._id),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Error getting saved products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Save a product
 * @route   POST /api/products/:productId/save
 * @access  Private
 */
export const saveProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { notes } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if already saved
    const existingSave = await SavedProduct.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existingSave) {
      return res.status(400).json({ message: "Product already saved" });
    }

    const savedProduct = await SavedProduct.create({
      user: req.user._id,
      product: productId,
      notes,
    });

    res.status(201).json({
      message: "Product saved successfully",
      savedProduct,
    });
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Unsave a product
 * @route   DELETE /api/products/:productId/save
 * @access  Private
 */
export const unsaveProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await SavedProduct.findOneAndDelete({
      user: req.user._id,
      product: productId,
    });

    if (!result) {
      return res.status(404).json({ message: "Saved product not found" });
    }

    res.status(200).json({ message: "Product unsaved successfully" });
  } catch (error) {
    console.error("Error unsaving product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Check if product is saved
 * @route   GET /api/products/:productId/saved-status
 * @access  Private
 */
export const checkSavedStatus = async (req, res) => {
  try {
    const { productId } = req.params;

    const savedProduct = await SavedProduct.findOne({
      user: req.user._id,
      product: productId,
    });

    res.status(200).json({ isSaved: !!savedProduct });
  } catch (error) {
    console.error("Error checking saved status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
