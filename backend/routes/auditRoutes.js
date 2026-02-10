import express from "express";
import AuditController from "../controllers/auditController.js";

const router = express.Router();

router.post("/log", AuditController.log);
router.get("/logs", AuditController.logs);

export default router;
