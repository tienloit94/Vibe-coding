import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables directly here to avoid import hoisting issues
dotenv.config();

console.log("☁️  Configuring Cloudinary...");
console.log(
  "  CLOUDINARY_CLOUD_NAME:",
  process.env.CLOUDINARY_CLOUD_NAME || "NOT SET"
);
console.log(
  "  CLOUDINARY_API_KEY:",
  process.env.CLOUDINARY_API_KEY
    ? "***" + process.env.CLOUDINARY_API_KEY.slice(-4)
    : "NOT SET"
);
console.log(
  "  CLOUDINARY_API_SECRET:",
  process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET"
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dkwaqchpn",
  api_key: process.env.CLOUDINARY_API_KEY || "563531253793339",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "A7LiQjAzFw9K-FOTytE4d1UdnHY",
  secure: true,
});

// Test connection
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.api
    .ping()
    .then((result) => {
      console.log("✅ Cloudinary connection successful");
    })
    .catch((error) => {
      console.error("❌ Cloudinary connection failed:", error.message);
    });
} else {
  console.warn(
    "⚠️  Using Cloudinary with fallback credentials (env vars not found)"
  );
}

export default cloudinary;
