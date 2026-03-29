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

const allowedOrigins = [
  "http://localhost:5173",
  "https://gtshop.online",
  "https://www.gtshop.online",
  "https://your-vercel-app.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

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