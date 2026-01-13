
import express from "express";
import "dotenv/config";
import cors from "cors";              // ✅ ADD
import connectDB from "./database/db.js";
import userRoute from "./routes/userRoute.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { User } from "./models/userModel.js";
// import { User } from "./models/User.js";
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

app.get("/api/v1/user/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -__v");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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
