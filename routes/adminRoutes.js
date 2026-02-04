import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { getDashboardStats } from "../controllers/adminController";

const router = express.Router();

// ✅ DASHBOARD STATS ROUTE
router.get(
  "/dashboard-stats",
  authMiddleware,
  isAdmin,
  getDashboardStats
);

export default router;
