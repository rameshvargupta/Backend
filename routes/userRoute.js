import express from "express";

/* ========= Controllers ========= */
import {
  sendSignupOtp,
  verifySignupOtpAndRegister,
  loginUser,
  logoutUser,
  forgotPasswordWithOtp,
  resetPasswordWithOtp,
  getAllUsers,
  getUserById,
  resendSignupOtp,
  resendForgotOtp,
  getMyProfile,
  updateUserProfile,
  getUserOrders,
  changePassword,
} from "../controllers/userController.js";

/* ========= Middlewares ========= */
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { otpLimiter } from "../middleware/rateLimiter.js";
import upload from "../middleware/multer.js";
// import multer from "multer";

const router = express.Router();

// 🔹 Step 1: Send OTP for signup
router.post("/signup/send-otp", otpLimiter, sendSignupOtp);

// 🔹 Step 2: Verify OTP + Register user
router.post("/signup/verify-otp", verifySignupOtpAndRegister);

// 🔹 Login
router.post("/login", loginUser);

// 🔹 Logout (JWT required)
router.post("/logout", authMiddleware, logoutUser);

// 🔹 Send OTP for forgot password
router.post("/forgot-password-otp", forgotPasswordWithOtp);

// 🔹 Reset password using OTP
router.post("/reset-password-otp", resetPasswordWithOtp);

/* =====================================================
   ADMIN ROUTES
===================================================== */

// 🔹 Get all users (Admin only)
router.get(
  "/users",
  authMiddleware,
  isAdmin,
  getAllUsers
);
router.get("/admin/users", authMiddleware, isAdmin, getAllUsers);
router.get("/me", authMiddleware, getMyProfile);
// 🔹 Get user by ID (Admin only)
router.get(
  "/user/:id",
  authMiddleware,
  isAdmin,
  getUserById
);


router.put(
  "/profile/update",
  authMiddleware,
  upload.single("profilePic"),
updateUserProfile
);

router.put("/change-password", authMiddleware, changePassword);

// ✅ USER ORDERS
router.get("/my-orders", authMiddleware, getUserOrders);

router.post("/resend-signup-otp", resendSignupOtp);
router.post("/resend-forgot-otp", resendForgotOtp);



export default router;
