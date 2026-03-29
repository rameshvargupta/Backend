import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "Ecart", // ✅ safe way
      serverSelectionTimeoutMS: 5000, // fast fail
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    console.log("❌ DB Connection Failed:", error.message);
    process.exit(1); // crash if DB fails (important)
  }
};

export default connectDB;