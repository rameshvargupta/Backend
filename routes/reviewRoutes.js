import express from "express";
import upload from "../middleware/multer.js";
import {
    addProductReview,
    approveReview,
    deleteProductReview,
    getAllReviews,
    getPendingReviews,
    getProductReviews,
    rejectReview,
    updateProductReview,
    getMyReview,
    adminDeleteReview
} from "../controllers/reviewController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/* --- ADMIN ROUTES --- */
// Sabhi reviews fetch karne ke liye sirf controller use karein
router.get("/admin/reviews", authMiddleware, isAdmin, getAllReviews);
router.get("/admin/reviews/pending", authMiddleware, isAdmin, getPendingReviews);
router.patch("/admin/reviews/:id/approve", authMiddleware, isAdmin, approveReview);
router.patch("/admin/reviews/:id/reject", authMiddleware, isAdmin, rejectReview);
router.delete("/admin/reviews/:id", authMiddleware, isAdmin, adminDeleteReview);

/* --- PUBLIC ROUTES --- */
router.get("/products/:productId/reviews", getProductReviews);

/* USER ROUTES */
router.post("/products/:productId/reviews", authMiddleware, addProductReview);

router.put("/:id", authMiddleware, updateProductReview);

router.delete("/:id", authMiddleware, deleteProductReview);

router.get("/:id/my", authMiddleware, getMyReview);
export default router;