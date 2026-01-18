import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { addProduct } from "../controllers/productController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post(
  "/admin/product",
  authMiddleware,
  isAdmin,
  upload.array("images", 5), // 🔥 max 5 images
  addProduct
);


export default router;
