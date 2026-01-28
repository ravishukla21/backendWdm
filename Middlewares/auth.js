import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization; // "Bearer <token>"

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded => { userId, aadhaarNumber, iat, exp }

    req.user = decoded; // attach user data to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid/Expired token" });
  }
};
