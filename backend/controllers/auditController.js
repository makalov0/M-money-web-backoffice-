import AuditModel from "../models/auditModel.js";

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    ""
  );
}

export default class AuditController {
  // POST /api/audit/log
  static async log(req, res) {
    try {
      const ip = getClientIp(req);
      const userAgent = req.headers["user-agent"] || "";

      const u = req.user || {};
      const { action, page, target_type, target_id, detail } = req.body;

      if (!action) {
        return res.status(400).json({ success: false, message: "action is required" });
      }

      const saved = await AuditModel.createAuditLog({
        user_id: u.user_id ?? null,
        emp_id: u.emp_id ?? null,
        role: u.role ?? null,
        action,
        page,
        target_type,
        target_id,
        detail,
        ip,
        user_agent: userAgent,
      });

      return res.json({ success: true, data: saved });
    } catch (err) {
      console.error("audit log error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // GET /api/audit/logs
  static async logs(req, res) {
    try {
      const limit = Number(req.query.limit || 50);
      const offset = Number(req.query.offset || 0);

      const rows = await AuditModel.listAuditLogs(limit, offset);
      return res.json({ success: true, data: rows });
    } catch (err) {
      console.error("audit logs error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
}
