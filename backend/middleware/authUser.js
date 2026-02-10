// backend/middleware/authUser.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_ME_PLEASE";

export default function authUser(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      user_id: payload?.sub ?? null,
      emp_id: payload?.emp_id ?? null,
      role: payload?.role ?? null,
      jti: payload?.jti ?? null,
    };
  } catch {
    req.user = null;
  }

  next();
}
