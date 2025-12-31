import { User } from "../models/userModel.js";

export const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access denied"
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
