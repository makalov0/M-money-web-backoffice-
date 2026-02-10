import express from "express";
import BannerController from "../controllers/bannerController.js";

const router = express.Router();

router.get("/", BannerController.getAll);
router.post("/", BannerController.create);
router.put("/:id", BannerController.update);
router.delete("/:id", BannerController.delete);

export default router;
