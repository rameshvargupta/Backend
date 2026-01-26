import { User } from "../models/userModel.js";

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id); // ✅ _id from authMiddleware
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access denied" });
    }
    next(); // ✅ allow access
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
