import express from "express";
import ExternalMenuController from "../controllers/externalMenuController.js";

const router = express.Router();

// ✅ POST with body (your friend frontend)
router.post("/getmenu", ExternalMenuController.getMenu);
router.post("/getsubmenu", ExternalMenuController.getSubmenu);

export default router;
