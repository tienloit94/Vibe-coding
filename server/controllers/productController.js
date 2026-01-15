import Product from "../models/Product.js";
import User from "../models/User.js";

// Create new product
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, location } =
      req.body;

    // Handle uploaded images from Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push(file.path); // Cloudinary URL
      });
    }

    const product = await Product.create({
      seller: req.user._id,
      title,
      description,
      price,
      category,
      condition,
      location,
      images,
    });

    const populatedProduct = await Product.findById(product._id).populate(
      "seller",
      "name email avatar"
    );

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all products (marketplace)
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    let query = { status: "available" };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .populate("seller", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name email avatar"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's products
export const getUserProducts = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    const products = await Product.find({ seller: userId })
      .populate("seller", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Error fetching user products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user is the seller
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, price, category, condition, location, status } =
      req.body;

    if (title) product.title = title;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (category) product.category = category;
    if (condition) product.condition = condition;
    if (location !== undefined) product.location = location;
    if (status) product.status = status;

    // Handle new images from Cloudinary
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path); // Cloudinary URLs
      product.images = [...product.images, ...newImages];
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate(
      "seller",
      "name email avatar"
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user is the seller
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle like product
export const toggleLikeProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const likeIndex = product.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      product.likes.splice(likeIndex, 1);
    } else {
      product.likes.push(req.user._id);
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate("seller", "name email avatar")
      .populate("likes", "name avatar");

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get featured products for sidebar
export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const products = await Product.find({ status: "available" })
      .populate("seller", "name avatar")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(products);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({ message: "Server error" });
  }
};
