
// import express from "express";
// import "dotenv/config";
// import connectDB from "./database/db.js";
// import userRoute from "./routes/userRoute.js";

// const app = express();
// app.use(express.json());

// // ✅ Read port from .env
// const PORT = process.env.PORT || 3000;

// app.get("/test", (req, res) => {
//   res.json({ message: "API working" });
// });

// app.use("/api/v1/user", userRoute);

// const startServer = async () => {
//   try {
//     await connectDB();
//     app.listen(PORT, () => {
//       console.log(`Server is Running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Server start failed:", error);
//   }
// };

// startServer();


import express from "express";
import "dotenv/config";
import cors from "cors";              // ✅ ADD
import connectDB from "./database/db.js";
import userRoute from "./routes/userRoute.js";

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
