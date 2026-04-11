import express from "express";
const router = express.Router();  // ❗ YE MISSING NA HO

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

router.get("/", authMiddleware, getWishlist);
router.post("/:productId", authMiddleware, addToWishlist);
router.delete("/:productId", authMiddleware, removeFromWishlist);

export default router;