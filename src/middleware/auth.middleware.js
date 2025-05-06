// src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const auth = req.headers.authorization ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) return res.status(401).json({ msg: "Chybí token." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.sub; // <-- to je userId (ObjectId jako string)
    next();
  } catch (_) {
    res.status(401).json({ msg: "Neplatný nebo expirovaný token." });
  }
};
