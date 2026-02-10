import ExternalMenuModel from "../models/externalMenuModel.js";

class ExternalMenuController {
  static async getMenu(req, res) {
    try {
      const data = await ExternalMenuModel.getMenu();
      return res.json({ status: true, message: "ok", data });
    } catch (err) {
      const code = err?.response?.status || 500;
      console.log("🔥 external error status:", code);
      return res.status(code).json({
        status: false,
        message: "Failed to fetch external menu",
        error: err?.response?.data || err?.message,
      });
    }
  }

  static async getSubmenu(req, res) {
    try {
      const { menuId } = req.body || {};
      if (!menuId) {
        return res.status(400).json({
          status: false,
          message: "menuId is required in req.body",
          example: { menuId: 1 },
        });
      }

      const data = await ExternalMenuModel.getSubmenu(menuId);
      return res.json({ status: true, message: "ok", data });
    } catch (err) {
      const code = err?.response?.status || 500;
      console.log("🔥 external error status:", code);
      return res.status(code).json({
        status: false,
        message: "Failed to fetch external submenu",
        error: err?.response?.data || err?.message,
      });
    }
  }
}

export default ExternalMenuController;
