import jwt from "jsonwebtoken";
import crypto from "crypto";
import { createHash } from "crypto";
import AuthModel from "../models/authModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_ME_PLEASE";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRE || "2h";
const EMPLOYEE_PHONE_PREFIX = "205";

function parseJwtExpiryToMs(exp) {
  const s = String(exp).trim();
  const m = s.match(/^(\d+)([smhd])$/i);
  if (!m) return 2 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const u = m[2].toLowerCase();
  const mult =
    u === "s"
      ? 1000
      : u === "m"
      ? 60 * 1000
      : u === "h"
      ? 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;
  return n * mult;
}

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    ""
  );
}

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

export default class AuthController {
  // POST /api/auth/login
  static async login(req, res) {
    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";

    try {
      const { emp_id, phone } = req.body;

      if (!emp_id || !phone) {
        await AuthModel.createLoginLog({
          user_id: null,
          emp_id: emp_id || null,
          role: null,
          ip,
          user_agent: userAgent,
          success: false,
          message: "emp_id and phone are required",
          token_jti: null,
        });

        return res.status(400).json({
          success: false,
          message: "emp_id and phone are required",
        });
      }

      const user = await AuthModel.findByEmpId(emp_id);

      if (!user) {
        await AuthModel.createLoginLog({
          user_id: null,
          emp_id,
          role: null,
          ip,
          user_agent: userAgent,
          success: false,
          message: "User not found",
          token_jti: null,
        });

        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      if (user.status !== "active") {
        await AuthModel.createLoginLog({
          user_id: user.id,
          emp_id: user.emp_id,
          role: String(user.role).toUpperCase(),
          ip,
          user_agent: userAgent,
          success: false,
          message: "Account inactive",
          token_jti: null,
        });

        return res.status(403).json({
          success: false,
          message: "Account inactive",
        });
      }

      const roleUpper = String(user.role).toUpperCase();
      const isAdmin = roleUpper === "ADMIN";

      if (!["ADMIN", "EMPLOYEE"].includes(roleUpper)) {
        await AuthModel.createLoginLog({
          user_id: user.id,
          emp_id: user.emp_id,
          role: roleUpper,
          ip,
          user_agent: userAgent,
          success: false,
          message: "Role not allowed",
          token_jti: null,
        });

        return res.status(403).json({
          success: false,
          message: "Role not allowed",
        });
      }

      // EMPLOYEE => phone must match and start with 205
      // ADMIN => allow phone match OR "admin"
      if (!isAdmin) {
        if (phone !== user.phone) {
          await AuthModel.createLoginLog({
            user_id: user.id,
            emp_id: user.emp_id,
            role: roleUpper,
            ip,
            user_agent: userAgent,
            success: false,
            message: "Phone mismatch",
            token_jti: null,
          });

          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }

        if (!String(user.phone).startsWith(EMPLOYEE_PHONE_PREFIX)) {
          await AuthModel.createLoginLog({
            user_id: user.id,
            emp_id: user.emp_id,
            role: roleUpper,
            ip,
            user_agent: userAgent,
            success: false,
            message: `Phone not allowed (must start with ${EMPLOYEE_PHONE_PREFIX})`,
            token_jti: null,
          });

          return res.status(403).json({
            success: false,
            message: `Only phone starting with ${EMPLOYEE_PHONE_PREFIX} is allowed`,
          });
        }
      } else {
        if (phone !== "admin" && phone !== user.phone) {
          await AuthModel.createLoginLog({
            user_id: user.id,
            emp_id: user.emp_id,
            role: roleUpper,
            ip,
            user_agent: userAgent,
            success: false,
            message: "Invalid admin credentials",
            token_jti: null,
          });

          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }
      }

      // Create JWT
      const jti = crypto.randomUUID();
      const token = jwt.sign(
        { sub: user.id, emp_id: user.emp_id, role: roleUpper, jti },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const expiresAt = new Date(Date.now() + parseJwtExpiryToMs(JWT_EXPIRES_IN));

      await AuthModel.createTokenSession({
        user_id: user.id,
        emp_id: user.emp_id,
        role: roleUpper,
        token_jti: jti,
        token_hash: tokenHash(token),
        expires_at: expiresAt,
        ip,
        user_agent: userAgent,
      });

      await AuthModel.updateLastLogin(user.id);

      await AuthModel.createLoginLog({
        user_id: user.id,
        emp_id: user.emp_id,
        role: roleUpper,
        ip,
        user_agent: userAgent,
        success: true,
        message: "Login success",
        token_jti: jti,
      });

      // ✅ include full_name so frontend can show admin name
      return res.json({
        success: true,
        token,
        profile: {
          emp_id: user.emp_id,
          email: user.email || "",
          role: roleUpper,
          full_name: user.full_name || "",
        },
      });
    } catch (err) {
      console.error("❌ login error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // POST /api/auth/logout
  static async logout(req, res) {
    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";

    try {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
      if (!token) return res.status(401).json({ success: false, message: "Missing token" });

      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch {
        return res.status(401).json({ success: false, message: "Invalid/Expired token" });
      }

      const jti = payload?.jti;
      const user_id = payload?.sub || null;
      const emp_id = payload?.emp_id || null;
      const role = payload?.role || null;

      if (!jti) return res.status(400).json({ success: false, message: "Invalid token (no jti)" });

      await AuthModel.revokeTokenByJti(jti, "logout");

      await AuthModel.ensureLogoutLogExists({
        user_id,
        emp_id,
        role,
        ip,
        user_agent: userAgent,
        token_jti: jti,
      });

      await AuthModel.closeLoginLogByJti(jti);

      return res.json({ success: true, message: "Logged out" });
    } catch (err) {
      console.error("❌ logout error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // GET /api/auth/logs
  static async logs(req, res) {
    try {
      const limit = Number(req.query.limit || 50);
      const offset = Number(req.query.offset || 0);

      const rows = await AuthModel.getLoginLogs(limit, offset);
      return res.json({ success: true, data: rows });
    } catch (err) {
      console.error("❌ logs error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
}
