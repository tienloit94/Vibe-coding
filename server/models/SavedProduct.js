import mongoose from "mongoose";

const savedProductSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: mỗi user chỉ save 1 product 1 lần
savedProductSchema.index({ user: 1, product: 1 }, { unique: true });
// Index for querying user's saved products
savedProductSchema.index({ user: 1, createdAt: -1 });

const SavedProduct = mongoose.model("SavedProduct", savedProductSchema);

export default SavedProduct;
