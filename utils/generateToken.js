import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  if (!process.env.SECRET_KEY) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.sign(
    { userId },
    process.env.SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};
