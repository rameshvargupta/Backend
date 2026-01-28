import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import {
  createOrder,
  downloadInvoice,
  getAllOrders,
  getAllUsers,
  getMyOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrderStatus
} from "../controllers/orderController.js";

const router = express.Router();

/* ========== USER ========== */
router.post("/", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getMyOrders); // ✅ FIRST
router.get("/:id", authMiddleware, getOrderById);      // ✅ AFTER

/* ========== ADMIN ========== */
router.get("/admin/orders", authMiddleware, isAdmin, getAllOrders);
router.get("/admin/users", authMiddleware, isAdmin, getAllUsers);
router.put("/admin/order/:id", authMiddleware, isAdmin, updateOrderStatus);
router.get(
  "/admin/user/:userId/orders",
  authMiddleware,
  isAdmin,
  getOrdersByUserId
);

router.get("/invoice/:id", authMiddleware, downloadInvoice);


export default router;
