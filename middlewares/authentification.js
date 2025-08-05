import jwt from "jsonwebtoken";
import "dotenv/config";
const JWT_SECRET = process.env.JWT_SECRET;

export async function isAuthJwt(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ message: "Token manquant ou invalide." }).status(401);
  }
  try {
    let decoded = await jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide ou expiré." });
  }
}

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Non authentifié" });
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Accès interdit: rôle insuffisant" });
    }
    next();
  };
