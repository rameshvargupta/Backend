import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profilePic: { type: String, default: "" },
    profilePicPublicId: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    token: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    addess: { type: String },
    city: { type: String },
    zipCode: { type: String },
    phoneNb: { type: String },
    resetOtp: { type: String, default: null },
    resetOtpExpire: { type: Date, default: null },



}, { timestamps: true });
export const User = mongoose.model("User", userSchema)