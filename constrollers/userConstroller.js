import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOtpEmail } from "../emailVerify/sendOtpEmail.js";
import { isStrongPassword } from "../utils/passwordValidator.js";
import cloudinary from "../utils/cloudinary.js";
import { generateOtp, otpExpireTime, canResendOtp } from "../utils/otp.js";
/* =====================================================
   1️⃣ SEND OTP FOR SIGNUP
===================================================== */
// export const sendSignupOtp = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ message: "Email required" });

//     const verifiedUser = await User.findOne({ email, isVerified: true });
//     if (verifiedUser)
//       return res.status(400).json({ message: "Email already registered" });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

//     await User.findOneAndUpdate(
//       { email },
//       {
//         signupOtp: hashedOtp,
//         signupOtpExpire: Date.now() + 5 * 60 * 1000,
//         signupOtpAttempts: 0
//       },
//       { upsert: true }
//     );

//     await sendOtpEmail(email, otp, "Signup Verification");

//     res.json({ success: true, message: "OTP sent to email" });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const sendSignupOtp = async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ message: "Email required" });

  let user = await User.findOne({ email });

  if (user && user.isVerified) {
    return res.status(400).json({ message: "User already exists" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  if (!user) {
    user = new User({ email }); // ✅ ONLY EMAIL
  }

  user.signupOtp = otp;
  user.signupOtpExpire = Date.now() + 5 * 60 * 1000; // 5 min
  await user.save({ validateBeforeSave: false }); // ⭐ IMPORTANT

  // send email here

  res.json({ success: true, message: "OTP sent" });
};

/* =====================================================
   2️⃣ VERIFY OTP & COMPLETE REGISTRATION
===================================================== */
// export const verifySignupOtpAndRegister = async (req, res) => {
//   try {
//     const { firstName, lastName, email, password, otp } = req.body;

//     if (!firstName || !lastName || !email || !password || !otp)
//       return res.status(400).json({ message: "All fields required" });

//     const user = await User.findOne({ email });

//     if (!isStrongPassword(password)) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Password must be at least 8 characters and include uppercase, lowercase, number and special character"
//       });
//     }

//     if (!user || user.signupOtpExpire < Date.now())
//       return res.status(400).json({ message: "OTP expired" });

//     if (user.signupOtpAttempts >= 10)
//       return res.status(429).json({ message: "Too many attempts" });

//     const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

//     if (user.signupOtp !== hashedOtp) {
//       user.signupOtpAttempts += 1;
//       await user.save();
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     user.firstName = firstName;
//     user.lastName = lastName;
//     user.password = await bcrypt.hash(password, 10);
//     user.isVerified = true;
//     user.signupOtp = null;
//     user.signupOtpExpire = null;
//     user.signupOtpAttempts = 0;

//     await user.save();

//     res.status(201).json({
//       success: true,
//       message: "Account created successfully"
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const verifySignupOtpAndRegister = async (req, res) => {
  const { firstName, lastName, email, otp, password } = req.body;

  if (!firstName || !lastName || !email || !otp || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({ message: "OTP not sent" });

  if (
    user.signupOtp !== otp ||
    user.signupOtpExpire < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.firstName = firstName;
  user.lastName = lastName;
  user.password = password; // hash middleware chalega
  user.isVerified = true;
  user.signupOtp = null;
  user.signupOtpExpire = null;

  await user.save(); // ✅ now validation passes

  res.json({ success: true, message: "Account created" });
};



/* =====================================================
   3️⃣ LOGIN USER
===================================================== */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Email not verified"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    user.isLoggedIn = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================================
   4️⃣ LOGOUT USER
===================================================== */
export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.isLoggedIn = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================================
   5️⃣ FORGOT PASSWORD (SEND OTP)
===================================================== */
export const forgotPasswordWithOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.resetOtp = hashedOtp;
    user.resetOtpExpire = Date.now() + 5 * 60 * 1000;

    await user.save();
    await sendOtpEmail(email, otp, "Password Reset");

    return res.status(200).json({
      success: true,
      message: "OTP sent to email"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =====================================================
   6️⃣ RESET PASSWORD USING OTP
===================================================== */
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const user = await User.findOne({
      email,
      resetOtp: hashedOtp,
      resetOtpExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number and special character"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpire = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// resend otp for login 

export const resendSignupOtp = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({ message: "User not found" });

  if (user.isVerified)
    return res.status(400).json({ message: "Already verified" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.signupOtp = otp;
  user.signupOtpExpire = Date.now() + 5 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: "OTP resent" });
};


// resend otp for forgot 

export const resendForgotOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (!canResendOtp(user.resendOtpAt)) {
      return res.status(429).json({
        success: false,
        message: "Please wait 30 seconds before resending OTP",
      });
    }

    const otp = generateOtp();

    user.resetOtp = otp;
    user.resetOtpExpire = otpExpireTime();
    user.resendOtpAt = new Date();

    await user.save();

    await sendOtpEmail(
      email,
      "Ecart Password Reset OTP",
      `Your password reset OTP is ${otp}. Valid for 10 minutes`
    );

    res.json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// all user find as admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.status(200).json({
      success: true,
      totalUsers: users.length,
      users
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🧾 Find user by ID and exclude sensitive fields
    const user = await User.findById(id).select(
      "-password -token -otp -otpExpiry -resetOtp -resetOtpExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update profile fields
    const { firstName, lastName, phoneNo, address, city, pinCode } = req.body;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNo) user.phoneNo = phoneNo;
    if (address) user.address = address;
    if (city) user.city = city;
    if (pinCode) user.pinCode = pinCode;

    // Update avatar if file uploaded
    if (req.file) {
      // delete old image
      if (user.profilePicPublicId) {
        await cloudinary.uploader.destroy(user.profilePicPublicId);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "ecart/users",
      });

      user.profilePic = result.secure_url;
      user.profilePicPublicId = result.public_id;
    }

    await user.save();

    // ✅ Send user in frontend-friendly structure
    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        avatar: { url: user.profilePic || "/download.png", publicId: user.profilePicPublicId || "" },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


