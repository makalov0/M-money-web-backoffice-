// backend/routes/promotionRoutes.js
import express from "express";
import PromotionController from "../controllers/promotionController.js";

const router = express.Router();

// Get statistics (must be before /:id)
router.get("/statistics", PromotionController.getStatistics);

// Get active promotions
router.get("/active", PromotionController.getActivePromotions);

// Validate promotion code
router.post("/validate/:code", PromotionController.validatePromotion);

// Apply promotion (increment usage count)
router.post("/apply/:id", PromotionController.applyPromotion);

// Get promotion by code
router.get("/code/:code", PromotionController.getPromotionByCode);

// List + filters
router.get("/", PromotionController.getAllPromotions);

// Single by id
router.get("/:id", PromotionController.getPromotionById);

// Create
router.post("/", PromotionController.createPromotion);

// Update
router.put("/:id", PromotionController.updatePromotion);

// Delete
router.delete("/:id", PromotionController.deletePromotion);

export default router;
