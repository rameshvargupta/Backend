import express from "express";
import { updateReview, deleteReview } from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/reviews/:reviewId", authMiddleware, updateReview);
router.delete("/reviews/:reviewId", authMiddleware, deleteReview);

export default router;
