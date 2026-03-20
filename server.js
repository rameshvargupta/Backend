import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./database/db.js";

import userRoute from "./routes/userRoute.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import addressRoute from "./routes/addressRoute.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";

const app = express();

/* ================= CORS ================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/* ================= TEST ================= */

app.get("/test", (req, res) => {
  res.json({ message: "API working" });
});

/* ================= ROUTES ================= */

app.use("/api/v1/user", userRoute);

app.use("/api/v1/", productRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/reviews", reviewRoutes);
// app.use("/api/v1/products/reviews", reviewRoutes);

app.use("/api/v1/categories", categoryRoutes);

app.use("/api/v1/orders", orderRoutes);

app.use("/api/v1/user", addressRoute);

app.use("/api/v1/user/wishlist", wishlistRoutes);

app.use("/api/v1/banners", bannerRoutes);

app.use("/api/v1/admin", adminRoutes);

app.use("/api/v1/coupons", couponRoutes);

/* ================= STATIC ================= */

app.use("/uploads", express.static("uploads"));

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

const startServer = async () => {

  try {

    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {

    console.error("Server start failed:", error);

  }

};

startServer();