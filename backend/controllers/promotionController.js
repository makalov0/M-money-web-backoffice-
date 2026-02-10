// backend/controllers/promotionController.js
import PromotionModel from "../models/promotionModel.js";

// accept both camelCase and snake_case from frontend
const normalize = (b = {}) => ({
  code: b.code,
  name: b.name,
  description: b.description,
  type: b.type,

  discount_value: b.discount_value ?? b.discountValue,
  min_amount: b.min_amount ?? b.minAmount,
  max_discount: b.max_discount ?? b.maxDiscount,

  start_date: b.start_date ?? b.startDate,
  end_date: b.end_date ?? b.endDate,

  usage_limit: b.usage_limit ?? b.usageLimit,
  used_count: b.used_count ?? b.usedCount,

  status: b.status,

  applicable_services: b.applicable_services ?? b.applicableServices,
  created_by: b.created_by ?? b.createdBy,
});

class PromotionController {
  static async getAllPromotions(req, res) {
    try {
      const filters = {
        type: req.query.type,
        status: req.query.status,
        search: req.query.search,
      };
      const rows = await PromotionModel.getAllPromotions(filters);
      res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
      console.error("getAllPromotions error:", error);
      res.status(500).json({ success: false, message: "Error fetching promotions", error: error.message });
    }
  }

  static async getPromotionById(req, res) {
    try {
      const row = await PromotionModel.getPromotionById(Number(req.params.id));
      if (!row) return res.status(404).json({ success: false, message: "Promotion not found" });
      res.json({ success: true, data: row });
    } catch (error) {
      console.error("getPromotionById error:", error);
      res.status(500).json({ success: false, message: "Error fetching promotion", error: error.message });
    }
  }

  static async getPromotionByCode(req, res) {
    try {
      const row = await PromotionModel.getPromotionByCode(req.params.code);
      if (!row) return res.status(404).json({ success: false, message: "Promotion not found" });
      res.json({ success: true, data: row });
    } catch (error) {
      console.error("getPromotionByCode error:", error);
      res.status(500).json({ success: false, message: "Error fetching promotion", error: error.message });
    }
  }

  static async createPromotion(req, res) {
    try {
      const data = normalize(req.body);

      // required
      if (!data.code || !data.name || !data.description || !data.type || !data.start_date || !data.end_date) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
          required: ["code", "name", "description", "type", "start_date", "end_date"],
        });
      }

      // unique code
      const exists = await PromotionModel.getPromotionByCode(data.code);
      if (exists) return res.status(400).json({ success: false, message: "Promotion code already exists" });

      // ensure array
      if (!Array.isArray(data.applicable_services)) data.applicable_services = [];

      const newId = await PromotionModel.createPromotion({
        ...data,
        discount_value: data.discount_value ?? 0,
        min_amount: data.min_amount ?? 0,
        usage_limit: data.usage_limit ?? 0,
        used_count: data.used_count ?? 0,
        status: data.status ?? "scheduled",
        created_by: data.created_by ?? "admin",
      });

      const created = await PromotionModel.getPromotionById(newId);
      res.status(201).json({ success: true, message: "Promotion created successfully", data: created });
    } catch (error) {
      console.error("createPromotion error:", error);
      res.status(500).json({ success: false, message: "Error creating promotion", error: error.message });
    }
  }

  static async updatePromotion(req, res) {
    try {
      const id = Number(req.params.id);
      const existing = await PromotionModel.getPromotionById(id);
      if (!existing) return res.status(404).json({ success: false, message: "Promotion not found" });

      const data = normalize(req.body);

      // if code change => check unique
      if (data.code && data.code !== existing.code) {
        const codeExists = await PromotionModel.getPromotionByCode(data.code);
        if (codeExists) return res.status(400).json({ success: false, message: "Promotion code already exists" });
      }

      // if applicable_services provided, must be array
      if (data.applicable_services !== undefined && !Array.isArray(data.applicable_services)) {
        data.applicable_services = [];
      }

      const affected = await PromotionModel.updatePromotion(id, data);
      const updated = await PromotionModel.getPromotionById(id);

      res.json({
        success: true,
        message: affected === 0 ? "Promotion update successful (no changes detected)" : "Promotion updated successfully",
        data: updated,
      });
    } catch (error) {
      console.error("updatePromotion error:", error);
      res.status(500).json({ success: false, message: "Error updating promotion", error: error.message });
    }
  }

  static async deletePromotion(req, res) {
    try {
      const id = Number(req.params.id);
      const existing = await PromotionModel.getPromotionById(id);
      if (!existing) return res.status(404).json({ success: false, message: "Promotion not found" });

      const affected = await PromotionModel.deletePromotion(id);
      if (affected === 0) return res.status(500).json({ success: false, message: "Promotion deletion failed unexpectedly" });

      res.json({ success: true, message: "Promotion deleted successfully" });
    } catch (error) {
      console.error("deletePromotion error:", error);
      res.status(500).json({ success: false, message: "Error deleting promotion", error: error.message });
    }
  }

  static async getStatistics(req, res) {
    try {
      const stats = await PromotionModel.getStatistics();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("getStatistics error:", error);
      res.status(500).json({ success: false, message: "Error fetching statistics", error: error.message });
    }
  }

  static async getActivePromotions(req, res) {
    try {
      const rows = await PromotionModel.getActivePromotions();
      res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
      console.error("getActivePromotions error:", error);
      res.status(500).json({ success: false, message: "Error fetching active promotions", error: error.message });
    }
  }

  static async validatePromotion(req, res) {
    try {
      const { code } = req.params;
      const { amount } = req.body;

      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ success: false, message: "Valid amount is required" });
      }

      const promo = await PromotionModel.validatePromotion(code, Number(amount));
      if (!promo) return res.status(404).json({ success: false, message: "Invalid or expired promotion code" });

      // discount calculation
      let discountAmount = 0;
      if (promo.type === "percentage") {
        discountAmount = (Number(amount) * Number(promo.discount_value)) / 100;
        if (promo.max_discount && discountAmount > Number(promo.max_discount)) discountAmount = Number(promo.max_discount);
      } else if (promo.type === "fixed") {
        discountAmount = Number(promo.discount_value);
      }

      res.json({
        success: true,
        data: {
          promotion: promo,
          discountAmount,
          finalAmount: Number(amount) - discountAmount,
        },
      });
    } catch (error) {
      console.error("validatePromotion error:", error);
      res.status(500).json({ success: false, message: "Error validating promotion", error: error.message });
    }
  }

  static async applyPromotion(req, res) {
    try {
      const id = Number(req.params.id);
      const promo = await PromotionModel.getPromotionById(id);
      if (!promo) return res.status(404).json({ success: false, message: "Promotion not found" });

      if (Number(promo.used_count) >= Number(promo.usage_limit)) {
        return res.status(400).json({ success: false, message: "Promotion usage limit reached" });
      }

      const result = await PromotionModel.incrementUsageCount(id);
      res.json({ success: true, message: "Promotion applied successfully", data: result });
    } catch (error) {
      console.error("applyPromotion error:", error);
      res.status(500).json({ success: false, message: "Error applying promotion", error: error.message });
    }
  }
}

export default PromotionController;
