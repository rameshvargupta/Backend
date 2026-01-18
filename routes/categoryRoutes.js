import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { createCategory, getAllCategories } from "../controllers/categoryController.js";

const router = express.Router();

/* ADMIN */
router.post("/admin/category", authMiddleware, isAdmin, createCategory);

/* USER */
router.get("/categories", getAllCategories);

export default router;
