import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import MenuController from "../controllers/menuController.js";

const router = express.Router();

/* ✅ multer inline (no middleware/upload.js) */
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext || ".png"}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", MenuController.getAll);
router.get("/:id", MenuController.getById);

// ✅ accept multipart upload field name = "image"
router.post("/", upload.single("image"), MenuController.create);
router.put("/:id", upload.single("image"), MenuController.update);

router.delete("/:id", MenuController.delete);

export default router;
