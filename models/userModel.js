import mongoose from "mongoose";

/* ---------------- ADDRESS SUB-SCHEMA ---------------- */
const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true },
  },
  { _id: true }
);

/* ---------------- USER SCHEMA ---------------- */
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    // 🖼 Profile Image
    profilePic: { type: String, default: "" },
    profilePicPublicId: { type: String, default: "" },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    phoneNo: {
      type: String,
      trim: true,
      match: /^[0-9]{10}$/,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    addresses: { type: [addressSchema], default: [] },

    token: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },



    /* ------------ OTP & SECURITY ------------ */
    signupOtp: { type: String, default: null },
    signupOtpExpire: { type: Date, default: null },
    signupOtpAttempts: { type: Number, default: 0 },

    resetOtp: { type: String, default: null },
    resetOtpExpire: { type: Date, default: null },

    resendOtpAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* ---------------- EXPORT MODEL ---------------- */
export const User = mongoose.model("User", userSchema);
