import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { addProduct, deleteProduct, getAllProductsAdmin, getAllProductsUser, getProductReviews, getSimilarProducts, getSingleProductAdmin, getSingleProductBySlug, toggleProductStatus, updateProduct } from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import { Product } from "../models/Product.js";
import { addProductReview } from "../controllers/reviewController.js";

const router = express.Router();

router.post(
  "/admin/product",
  authMiddleware,
  isAdmin,
  upload.array("images", 5), // 🔥 max 5 images
  addProduct
);

router.put(
  "/admin/product/:id",
  authMiddleware,
  isAdmin,
  upload.array("images", 5),
  updateProduct
);

// admin – all products
router.get(
  "/admin/products",
  authMiddleware,
  isAdmin,
  getAllProductsAdmin
);

// 🔥 GET SINGLE PRODUCT (EDIT PAGE)
router.get(
  "/admin/product/:id",
  authMiddleware,
  isAdmin,
  getSingleProductAdmin
);

router.delete(
  "/admin/product/:id",
  authMiddleware,
  isAdmin,
  deleteProduct
);


// routes/productRoute.js
router.put(
  "/admin/product/status/:id",
  authMiddleware,
  isAdmin,
  toggleProductStatus
);


router.get("/products", getAllProductsUser);



// USER: Get all active products with filter, sort, pagination
router.get("/", async (req, res) => {
  try {
    const { category, sort, page = 1, limit = 12 } = req.query;

    // Only active products
    const query = { isActive: true };
    if (category) query.category = category;

    let productsQuery = Product.find(query);

    // Sort
    if (sort === "price_asc") productsQuery = productsQuery.sort({ finalPrice: 1 });
    if (sort === "price_desc") productsQuery = productsQuery.sort({ finalPrice: -1 });

    // Total count for pagination
    const total = await Product.countDocuments(query);

    // Pagination
    const products = await productsQuery
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("category");

    res.json({ success: true, products, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(
  "/similar/:productId/:categoryId",
  getSimilarProducts
);

router.get(
  "/:productId/reviews",
  getProductReviews
);


router.post(
  "/:productId/reviews",
  authMiddleware,
  addProductReview
);


// USER product details page
router.get("/products/:slug", getSingleProductBySlug);
export default router;

