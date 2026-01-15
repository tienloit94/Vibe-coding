import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure local storage (backup)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|webm|ogg|mov/;
  const allowedDocTypes = /pdf|doc|docx|txt|zip/;
  const allowedAudioTypes = /mp3|wav|ogg/;

  const extname = path.extname(file.originalname).toLowerCase().slice(1);

  const isImage =
    allowedImageTypes.test(extname) && file.mimetype.startsWith("image/");
  const isVideo =
    allowedVideoTypes.test(extname) && file.mimetype.startsWith("video/");
  const isDoc = allowedDocTypes.test(extname);
  const isAudio =
    allowedAudioTypes.test(extname) && file.mimetype.startsWith("audio/");

  if (isImage || isVideo || isDoc || isAudio) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${extname}. Supported formats: images, videos (MP4, WebM, OGG, MOV), audio, documents`
      )
    );
  }
};

// Upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: fileFilter,
});
