// backend/routes/chatRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import ChatController from "../controllers/chatController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// ✅ SAVE CHAT IMAGES HERE
const uploadDir = path.join(process.cwd(), "chatimage");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

/** CUSTOMER */
router.post("/customer/init", ChatController.customerInit);
router.get("/customer/conversation", ChatController.customerConversation);
router.get("/customer/messages/:conversationId", ChatController.customerMessages);
router.post("/customer/upload", upload.single("file"), ChatController.customerUploadImage);

/** ADMIN/EMPLOYEE */
router.get("/conversations", requireAuth, ChatController.listConversations);
router.get("/messages/:conversationId", requireAuth, ChatController.getMessages);
router.post("/upload", requireAuth, upload.single("file"), ChatController.uploadImage);

// ✅ DELETE
router.delete("/conversations/:conversationId", requireAuth, ChatController.deleteConversation);
router.delete("/messages/:messageId", requireAuth, ChatController.deleteMessage);

export default router;
