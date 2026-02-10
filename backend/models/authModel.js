import db from "../config/dbConnect.js";

class AuthModel {
  // Find user by emp_id
  static async findByEmpId(empId) {
    const { rows } = await db.query(
      `SELECT id, emp_id, phone, email, role, status, full_name
       FROM admin_users
       WHERE emp_id = $1
       LIMIT 1`,
      [empId]
    );
    return rows[0] || null;
  }

  static async updateLastLogin(userId) {
    await db.query(
      `UPDATE admin_users
       SET last_login_at = now(), updated_at = now()
       WHERE id = $1`,
      [userId]
    );
  }

  // Insert login log (success/fail)
  static async createLoginLog(payload) {
    const {
      user_id,
      emp_id,
      role, // "ADMIN" | "EMPLOYEE" | null
      ip,
      user_agent,
      success,
      message,
      token_jti,
    } = payload;

    try {
      const { rows } = await db.query(
        `INSERT INTO admin_login_logs
         (user_id, emp_id, role, ip, user_agent, success, message, token_jti)
         VALUES ($1, $2, $3::admin_role, $4, $5, $6, $7, $8)
         RETURNING id, user_id, emp_id, role, login_at, success, message, token_jti`,
        [user_id, emp_id, role, ip, user_agent, success, message, token_jti]
      );

      console.log("✅ admin_login_logs inserted:", rows[0]);
      return rows[0];
    } catch (err) {
      console.error("❌ createLoginLog error:", err?.message || err);
      return null;
    }
  }

  // Create token session
  static async createTokenSession({
    user_id,
    emp_id,
    role,
    token_jti,
    token_hash,
    expires_at,
    ip,
    user_agent,
  }) {
    const { rows } = await db.query(
      `INSERT INTO admin_tokens
       (user_id, emp_id, role, token_jti, token_hash, expires_at, ip, user_agent)
       VALUES ($1,$2,$3::admin_role,$4,$5,$6,$7,$8)
       RETURNING id, issued_at, expires_at, revoked_at`,
      [user_id, emp_id, role, token_jti, token_hash, expires_at, ip, user_agent]
    );
    return rows[0];
  }

  static async revokeTokenByJti(token_jti, reason = "logout") {
    const { rows } = await db.query(
      `UPDATE admin_tokens
       SET revoked_at = now(),
           revoked_reason = $2
       WHERE token_jti = $1 AND revoked_at IS NULL
       RETURNING id, token_jti, revoked_at, revoked_reason`,
      [token_jti, reason]
    );
    return rows[0] || null;
  }

  static async closeLoginLogByJti(token_jti) {
    const { rows } = await db.query(
      `UPDATE admin_login_logs
       SET logout_at = now(),
           duration_sec = EXTRACT(EPOCH FROM (now() - login_at))::BIGINT
       WHERE token_jti = $1 AND logout_at IS NULL
       RETURNING id, token_jti, login_at, logout_at, duration_sec`,
      [token_jti]
    );
    return rows[0] || null;
  }

  static async ensureLogoutLogExists({
    user_id,
    emp_id,
    role,
    ip,
    user_agent,
    token_jti,
  }) {
    const { rows } = await db.query(
      `SELECT id FROM admin_login_logs WHERE token_jti = $1 LIMIT 1`,
      [token_jti]
    );

    if (rows.length > 0) return rows[0];

    await this.createLoginLog({
      user_id,
      emp_id,
      role,
      ip,
      user_agent,
      success: true,
      message: "Logout without login log (auto-created)",
      token_jti,
    });

    return true;
  }

  // ✅ JOIN admin_users to show admin_name / admin_phone
  static async getLoginLogs(limit = 50, offset = 0) {
    const { rows } = await db.query(
      `SELECT
          ll.id,
          ll.user_id,
          ll.emp_id,
          ll.role,
          ll.login_at,
          ll.logout_at,
          ll.duration_sec,
          ll.ip,
          ll.user_agent,
          ll.success,
          ll.message,
          ll.token_jti,

          u.full_name AS admin_name,
          u.phone     AS admin_phone
       FROM admin_login_logs ll
       LEFT JOIN admin_users u
         ON u.id = ll.user_id
       ORDER BY ll.id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  }
}

export default AuthModel;
