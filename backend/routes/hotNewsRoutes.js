import express from "express";
import HotNewsController from "../controllers/hotNewsController.js";

const router = express.Router();

// GET /api/hot-news
router.get("/", HotNewsController.getAll);

// GET /api/hot-news/:id
router.get("/:id", HotNewsController.getById);

// POST /api/hot-news
router.post("/", HotNewsController.create);

// PUT /api/hot-news/:id
router.put("/:id", HotNewsController.update);

// DELETE /api/hot-news/:id
router.delete("/:id", HotNewsController.delete);

export default router;
