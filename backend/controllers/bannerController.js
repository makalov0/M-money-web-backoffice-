import BannerModel from "../models/bannerModel.js";

class BannerController {
  static async getAll(req, res) {
    try {
      const limit = Number(req.query.limit ?? 200);
      const offset = Number(req.query.offset ?? 0);

      const rows = await BannerModel.getAll({ limit, offset });
      return res.json({ status: true, data: rows });
    } catch (err) {
      console.error("getAll banners error:", err.code, err.message);
      return res.status(500).json({ status: false, code: err.code, message: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { title, description, web_view_url, img_url, index, status } = req.body;

      if (!description || !img_url) {
        return res.status(400).json({ status: false, message: "description and img_url are required" });
      }

      const created = await BannerModel.create({
        title: title ?? "New",
        description,
        web_view_url: web_view_url ?? null,
        img_url,
        index: index ?? null,
        status: status ?? "active",
      });

      return res.json({ status: true, data: created });
    } catch (err) {
      console.error("create banner error:", err.code, err.message);
      return res.status(500).json({ status: false, code: err.code, message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const w_id = Number(req.params.id);
      if (!Number.isFinite(w_id)) return res.status(400).json({ status: false, message: "Invalid id" });

      const updated = await BannerModel.updateById(w_id, req.body);
      if (!updated) return res.status(404).json({ status: false, message: "Banner not found" });

      return res.json({ status: true, data: updated });
    } catch (err) {
      console.error("update banner error:", err.code, err.message);
      return res.status(500).json({ status: false, code: err.code, message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const w_id = Number(req.params.id);
      if (!Number.isFinite(w_id)) return res.status(400).json({ status: false, message: "Invalid id" });

      const deleted = await BannerModel.deleteById(w_id);
      if (!deleted) return res.status(404).json({ status: false, message: "Banner not found" });

      return res.json({ status: true, message: "Deleted", data: deleted });
    } catch (err) {
      console.error("delete banner error:", err.code, err.message);
      return res.status(500).json({ status: false, code: err.code, message: err.message });
    }
  }
}

export default BannerController;
