// import express from "express";
// import userRoute from "./routes/userRoute.js"
// import "dotenv/config";
// import connectDB from "./database/db.js";

// const app = express();
// app.use(express.json());
// const PORT = process.env.PORT || 3000;
// app.use("/api/v1/user", userRoute)

// app.listen(PORT, () => {
//     connectDB();
//     console.log(`Server is Running ${PORT}`);

// })
// app.get("/test", (req, res) => {
//   res.json({ message: "API working" });
// });
import express from "express";
import "dotenv/config";
import connectDB from "./database/db.js";
import userRoute from "./routes/userRoute.js";

const app = express();
app.use(express.json());

// ✅ Read port from .env
const PORT = process.env.PORT || 3000;

app.get("/test", (req, res) => {
  res.json({ message: "API working" });
});

app.use("/api/v1/user", userRoute);

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
