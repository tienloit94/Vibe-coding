import multer from "multer";
import path from "path";
import cloudinary from "../config/cloudinary.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on mimetype
    let resourceType = "auto";
    if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
    } else if (file.mimetype.startsWith("image/")) {
      resourceType = "image";
    } else if (file.mimetype.startsWith("audio/")) {
      resourceType = "video"; // Cloudinary treats audio as video
    }

    return {
      folder: "chat-app",
      resource_type: resourceType,
      allowed_formats: undefined, // Let Cloudinary handle format validation
    };
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log("🔍 File filter check:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|webm|ogg|mov/; // Browser-friendly video formats only
  const allowedDocTypes = /pdf|doc|docx|txt|zip/;
  const allowedAudioTypes = /mp3|wav|ogg/;

  const extname = path.extname(file.originalname).toLowerCase().slice(1);

  // Check if it's an allowed type
  const isImage =
    allowedImageTypes.test(extname) && file.mimetype.startsWith("image/");
  const isVideo =
    allowedVideoTypes.test(extname) && file.mimetype.startsWith("video/");
  const isDoc = allowedDocTypes.test(extname);
  const isAudio =
    allowedAudioTypes.test(extname) && file.mimetype.startsWith("audio/");

  console.log("  ✓ Validation:", { extname, isImage, isVideo, isDoc, isAudio });

  if (isImage || isVideo || isDoc || isAudio) {
    console.log("  ✅ File accepted");
    return cb(null, true);
  } else {
    console.log("  ❌ File rejected");
    cb(
      new Error(
        `Invalid file type: ${extname}. Supported video formats: MP4, WebM, OGG, MOV`
      )
    );
  }
};

// Upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
  },
  fileFilter: fileFilter,
});

// Export cloudinary for other uses
export { cloudinary };
