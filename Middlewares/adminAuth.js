import jwt from "jsonwebtoken";

export const adminAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    // decoded: { role: "ADMIN", username, iat, exp }
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "Admins only" });
    }

    req.admin = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid/Expired admin token" });
  }
};
