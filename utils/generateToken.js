// utils/jwt.js
import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  if (!process.env.SECRET_KEY) throw new Error("JWT_SECRET is missing");

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role // ⚡ include role here
    },
    process.env.SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};
