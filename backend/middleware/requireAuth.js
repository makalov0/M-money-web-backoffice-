// backend/middleware/requireAuth.js
export default function requireAuth(req, res, next) {
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
}
