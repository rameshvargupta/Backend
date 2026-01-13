import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    console.log("Auth header:", req.headers.authorization);

    const token = req.headers.authorization?.split(" ")[1];
    console.log("Extracted token:", token);

    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    if (!process.env.SECRET_KEY) {
      throw new Error("JWT SECRET_KEY not defined");
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded token:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
