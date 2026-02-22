import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} from "../controllers/wishlistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET wishlist
router.get("/", authMiddleware, getWishlist);

// ADD product to wishlist
router.post("/:productId", authMiddleware, addToWishlist);

// REMOVE product from wishlist
router.delete("/:productId", authMiddleware, removeFromWishlist);

export default router;