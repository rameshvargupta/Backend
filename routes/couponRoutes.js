import express from "express";
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  getAvailableCoupons,
  toggleCouponStatus
} from "../controllers/couponController.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/admin/create", authMiddleware, isAdmin, createCoupon);

router.get("/admin/all", authMiddleware, isAdmin, getAllCoupons);

router.put("/admin/update/:id", authMiddleware, isAdmin, updateCoupon);

router.delete("/admin/delete/:id", authMiddleware, isAdmin, deleteCoupon);

router.patch("/admin/toggle/:id", authMiddleware, isAdmin, toggleCouponStatus);

router.post("/apply", authMiddleware, applyCoupon);

router.get("/available", getAvailableCoupons);

export default router;