import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import {
  cancelOrder,
  createOrder,
  downloadInvoice,
  getAllOrdersAdmin,
  getAllUsers,
  getLast30DaysSoldCount,
  getMyOrders,
  getOrderById,
  getOrdersByUserId,
  getUserByIdAdmin,
  getUserStatsAdmin,
  updateOrderStatus
} from "../controllers/orderController.js";

const router = express.Router();

/* ========== USER ========== */
router.post("/", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getMyOrders); // ✅ FIRST
router.get("/:id", authMiddleware, getOrderById);      // ✅ AFTER

/* ========== ADMIN ========== */
router.get("/admin/orders", authMiddleware, isAdmin,getAllOrdersAdmin);
router.get("/admin/users", authMiddleware, isAdmin, getAllUsers);
router.put("/admin/order/:id", authMiddleware, isAdmin, updateOrderStatus);
router.get(
  "/admin/user/:userId/orders",
  authMiddleware,
  isAdmin,
  getOrdersByUserId
);

router.get(
  "/admin/users/:id",
  authMiddleware,
  isAdmin,
  getUserByIdAdmin
);
router.get(
  "/admin/users/:id/stats",
  authMiddleware,
  isAdmin,
  getUserStatsAdmin
);


router.get(
  "/:id/last-30-days-sold",
  getLast30DaysSoldCount
);


router.get("/invoice/:id", authMiddleware, downloadInvoice);


router.put("/cancel/:id",authMiddleware,cancelOrder)


export default router;
