import MenuModel from "../models/menuModel.js";

class MenuController {
  static async getAll(req, res) {
    try {
      const rows = await MenuModel.getAll();
      res.json({ status: true, data: rows });
    } catch (err) {
      console.error("Menu getAll error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const row = await MenuModel.getById(Number(id));
      if (!row) return res.status(404).json({ status: false, message: "Not found" });
      res.json({ status: true, data: row });
    } catch (err) {
      console.error("Menu getById error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async create(req, res) {
    try {
      // multer (if multipart) => fields come as string
      const { name, name_lao, group_name, order_index, order_group_index, status, description } = req.body;

      if (!name || !name_lao) {
        return res.status(400).json({
          status: false,
          message: "name, name_lao are required",
        });
      }

      // ✅ image upload OR image url
      const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || null);

      const created = await MenuModel.create({
        name,
        name_lao,
        group_name: group_name || null,
        order_index: order_index !== undefined && order_index !== "" ? Number(order_index) : null,
        order_group_index: order_group_index !== undefined && order_group_index !== "" ? Number(order_group_index) : null,
        status: status || "A",
        image,
        description: description || null,
      });

      res.json({ status: true, data: created });
    } catch (err) {
      console.error("Menu create error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const old = await MenuModel.getById(Number(id));
      if (!old) return res.status(404).json({ status: false, message: "Not found" });

      const { name, name_lao, group_name, order_index, order_group_index, status, description } = req.body;

      if (!name || !name_lao) {
        return res.status(400).json({
          status: false,
          message: "name, name_lao are required",
        });
      }

      // ✅ if upload new file -> replace, else keep old
      const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image ?? old.image);

      const updated = await MenuModel.update(Number(id), {
        name,
        name_lao,
        group_name: group_name || null,
        order_index: order_index !== undefined && order_index !== "" ? Number(order_index) : null,
        order_group_index: order_group_index !== undefined && order_group_index !== "" ? Number(order_group_index) : null,
        status: status || "A",
        image,
        description: description || null,
      });

      res.json({ status: true, data: updated });
    } catch (err) {
      console.error("Menu update error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await MenuModel.delete(Number(id));
      if (!deleted) return res.status(404).json({ status: false, message: "Not found" });
      res.json({ status: true, message: "Deleted" });
    } catch (err) {
      console.error("Menu delete error:", err);
      res.status(500).json({ status: false, message: err.message });
    }
  }
}

export default MenuController;
