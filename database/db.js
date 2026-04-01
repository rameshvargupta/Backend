import mongoose from "mongoose";
// import "dotenv/config";
const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/Ecart`)
        console.log("data base connection successfully");

    } catch (error) {
        console.log("data base connetion failed", error);

    }
}
export default connectDB