import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import SubmenuController from "../controllers/submenuController.js";

const router = express.Router();

/* ✅ multer inline */
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

router.get("/", SubmenuController.getAll);
router.get("/:id", SubmenuController.getById);

router.post("/", upload.single("image"), SubmenuController.create);
router.put("/:id", upload.single("image"), SubmenuController.update);

router.delete("/:id", SubmenuController.delete);

export default router;
