import HotNewsModel from "../models/hotNewsModel.js";

class HotNewsController {
  static async getAll(req, res) {
    try {
      const rows = await HotNewsModel.getAll();
      res.json({ status: true, data: rows });
    } catch (err) {
      console.error("HotNews getAll error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const row = await HotNewsModel.getById(Number(id));
      if (!row) return res.status(404).json({ status: false, message: "Not found" });
      res.json({ status: true, data: row });
    } catch (err) {
      console.error("HotNews getById error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { title, description, content, img_url, web_view_url, category, status } = req.body;

      if (!title || !description || !img_url) {
        return res.status(400).json({
          status: false,
          message: "title, description, img_url are required",
        });
      }

      const created = await HotNewsModel.create({
        title,
        description,
        content,
        img_url,
        web_view_url,
        category,
        status,
      });

      res.json({ status: true, data: created });
    } catch (err) {
      console.error("HotNews create error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, content, img_url, web_view_url, category, status } = req.body;

      if (!title || !description || !img_url) {
        return res.status(400).json({
          status: false,
          message: "title, description, img_url are required",
        });
      }

      const updated = await HotNewsModel.update(Number(id), {
        title,
        description,
        content,
        img_url,
        web_view_url,
        category,
        status,
      });

      if (!updated) return res.status(404).json({ status: false, message: "Not found" });

      res.json({ status: true, data: updated });
    } catch (err) {
      console.error("HotNews update error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await HotNewsModel.delete(Number(id));
      if (!deleted) return res.status(404).json({ status: false, message: "Not found" });
      res.json({ status: true, message: "Deleted" });
    } catch (err) {
      console.error("HotNews delete error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  }
}

export default HotNewsController;
