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

const app = express();

app.use(cors());
app.use(express.json());
/* ROUTES */
app.use("/api/v1/user", userRoute);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/userAdr", addressRoute);
app.use("/api/v1/user/wishlist", wishlistRoutes);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/coupons", couponRoutes);

/* STATIC */
app.use("/uploads", express.static("uploads"));



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;   // ✅ MOST IMPORTANT