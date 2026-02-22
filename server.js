
import express from "express";
import "dotenv/config";
import cors from "cors";             
import connectDB from "./database/db.js";
import userRoute from "./routes/userRoute.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { User } from "./models/userModel.js";
import orderRoutes from "./routes/orderRoutes.js"; 
import reviewRoutes from "./routes/reviewRoutes.js";
import addressRoute from "./routes/addressRoute.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";


const app = express();

// ✅ CORS middleware (IMPORTANT)
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  })
);

app.use(express.json());

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "API working" });
});

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/", productRoutes);
app.use("/api/v1", categoryRoutes);

app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes); 
app.use("/api/v1", reviewRoutes);
app.get("/api/v1/user/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -__v");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
app.use("/api/v1/user", addressRoute);

app.use("/uploads", express.static("uploads"));
// routes
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/user/wishlist", wishlistRoutes);

// Server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is Running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server start failed:", error);
  }
};

startServer();
