

// import jwt from "jsonwebtoken";

// export const authMiddleware = (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ success: false, message: "Token missing" });

//     const decoded = jwt.verify(token, process.env.SECRET_KEY);
//     req.user = decoded;
//     role = user.role,
//       next(); // ✅ must call next
//   } catch (error) {
//     return res.status(401).json({ success: false, message: "Invalid or expired token" });
//   }
// };

// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Token missing" });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    console.log("Decoded token:", decoded); // debug

    req.user = {
      userId: decoded.userId,
      role: decoded.role // ⚡ now admin/user
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
