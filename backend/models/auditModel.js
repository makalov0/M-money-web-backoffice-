import db from "../config/dbConnect.js";

class AuditModel {
  static async createAuditLog({
    user_id,
    emp_id,
    role,
    action,
    page,
    target_type,
    target_id,
    detail,
    ip,
    user_agent,
  }) {
    const { rows } = await db.query(
      `INSERT INTO admin_audit_logs
       (user_id, emp_id, role, action, page, target_type, target_id, detail, ip, user_agent)
       VALUES ($1,$2,$3::admin_role,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, created_at`,
      [
        user_id,
        emp_id,
        role,
        action,
        page || null,
        target_type || null,
        target_id || null,
        detail ? JSON.stringify(detail) : null,
        ip || null,
        user_agent || null,
      ]
    );
    return rows[0];
  }

  // ✅ JOIN admin_users to show admin_name / admin_phone
  static async listAuditLogs(limit = 50, offset = 0) {
    const { rows } = await db.query(
      `SELECT
          al.id,
          al.user_id,
          al.emp_id,
          al.role,
          al.action,
          al.page,
          al.target_type,
          al.target_id,
          al.detail,
          al.ip,
          al.user_agent,
          al.created_at,

          u.full_name AS admin_name,
          u.phone     AS admin_phone
       FROM admin_audit_logs al
       LEFT JOIN admin_users u
         ON u.id = al.user_id
       ORDER BY al.id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }
}

export default AuditModel;
