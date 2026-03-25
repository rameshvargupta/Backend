import express from "express";
import "dotenv/config";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import userRoute from "./routes/userRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import addressRoute from "./routes/addressRoute.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import connectDB from "./database/db.js";

const app = express();

/* CORS */
app.use(cors({
  origin: "*", // ⚠️ change later to frontend URL
  credentials: true
}));

app.use(express.json());

/* DB connect (IMPORTANT) */
await connectDB();

/* TEST */
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

/* ROUTES */
app.use("/api/v1/user", userRoute);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/user", addressRoute);
app.use("/api/v1/user/wishlist", wishlistRoutes);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/coupons", couponRoutes);

/* STATIC */
app.use("/uploads", express.static("uploads"));

export default app;   // ✅ MOST IMPORTANT