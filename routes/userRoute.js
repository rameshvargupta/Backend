import express from "express";

import {
  register,
  verifyUserEmail,
  reVerifyEmail,
  loginUser,
  logoutUser,
  forgotPasswordWithOtp,
  resetPasswordWithOtp,
  getAllUsers,
  getUserById
} from "../constrollers/userConstroller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";


const router = express.Router();

router.post("/register", register);
router.get("/verify/:token", verifyUserEmail);
router.post("/reverify", reVerifyEmail);
router.post("/login", loginUser);
router.post("/forgot-password-otp", forgotPasswordWithOtp);
router.post("/reset-password-otp", resetPasswordWithOtp);
router.post("/logout", authMiddleware, logoutUser);

router.get(
  "/users",
  authMiddleware,   // JWT required
  adminMiddleware,  // role === admin
  getAllUsers
);
router.get(
  "/user/:id",
  authMiddleware,
  adminMiddleware,
  getUserById
);


export default router;
