// src/routes/report.routes.js
import { Router } from "express";
import {
  getLogWebMmoneyReport,
  exportLogWebMmoneyCSV,
} from "../controllers/reportLogWebMmoneycontroller.js";

const router = Router();

// list + filters + pagination + sorting
router.get("/log-web-mmoney", getLogWebMmoneyReport);

// optional export CSV
router.get("/log-web-mmoney/export", exportLogWebMmoneyCSV);

export default router;
