import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createRazorpayOrder } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", authMiddleware, createRazorpayOrder);

export default router;