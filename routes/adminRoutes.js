import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { getDashboardStats } from "../controllers/adminController";
import { deleteUser, toggleBlockUser } from "../controllers/userController.js";

const router = express.Router();

// ✅ DASHBOARD STATS ROUTE
router.get(
  "/dashboard-stats",
  authMiddleware,
  isAdmin,
  getDashboardStats
);

router.put(
  "/users/block/:id",
  authMiddleware,
  isAdmin,
  toggleBlockUser
);
router.delete(
  "/users/:id",
  authMiddleware,
  isAdmin,
  deleteUser
);

export default router;
