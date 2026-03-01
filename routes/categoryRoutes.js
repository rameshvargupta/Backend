import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../controllers/categoryController.js";

const router = express.Router();

/* ADMIN */
router.post("/admin/category", authMiddleware, isAdmin, createCategory);
router.put("/admin/category/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/admin/category/:id", authMiddleware, isAdmin, deleteCategory);
/* USER */
router.get("/categories", getAllCategories);

export default router;
