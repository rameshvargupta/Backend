import express from "express";
// import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { downloadInvoice } from "../controllers/orderController.js";
const router = express.Router();

router.get("/invoice/:id", isAdmin, downloadInvoice);