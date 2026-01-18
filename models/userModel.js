

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  // 🖼 Profile Image (Cloudinary)
  profilePic: { type: String, default: "" },
  profilePicPublicId: { type: String, default: "" },

  email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true
},

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  token: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  isLoggedIn: { type: Boolean, default: false },

  // 📍 Address Info
  address: { type: String },
  city: { type: String },
  pinCode: { type: String },
  phoneNo: { type: String },

  // 🔐 SIGNUP OTP
  signupOtp: { type: String, default: null },
  signupOtpExpire: { type: Date, default: null },
  signupOtpAttempts: { type: Number, default: 0 },

  // 🔁 RESET PASSWORD OTP
  resetOtp: { type: String, default: null },
  resetOtpExpire: { type: Date, default: null },
  // resend Otp
  resendOtpAt: {
  type: Date,
  default: null,
},


}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
