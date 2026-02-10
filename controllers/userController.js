import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "../emailVerify/sendOtpEmail.js";
import { isStrongPassword } from "../utils/passwordValidator.js";
import cloudinary from "../utils/cloudinary.js";
import { generateOtp, otpExpireTime, canResendOtp } from "../utils/otp.js";
import { hashOtp } from "../utils/otpHash.js";
import { generateToken } from "../utils/generateToken.js";


/* =====================================================
   1️⃣ SEND OTP FOR SIGNUP*/

export const sendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    let user = await User.findOne({ email });

    if (user?.isVerified)
      return res.status(400).json({ message: "User already exists" });

    if (user && !canResendOtp(user.signupOtpResendAt)) {
      return res.status(429).json({
        message: "Please wait 30 seconds before resending OTP",
      });
    }

    const otp = generateOtp();

    if (!user) {
      user = new User({
        email,
        isVerified: false
      });
    }

    user.signupOtp = hashOtp(otp);
    user.signupOtpExpire = otpExpireTime(5);
    user.signupOtpAttempts = 0;
    user.signupOtpResendAt = new Date();

    await user.save({ validateBeforeSave: false });
    await sendOtpEmail(email, otp, "Ecart Signup OTP");

    res.json({ success: true, message: "OTP sent to email" });

  } catch (err) {
    res.status(500).json({ success: false, message: "OTP send failed" });
  }
};


/* =====================================================
   2️⃣ VERIFY OTP & COMPLETE REGISTRATION
===================================================== */

export const verifySignupOtpAndRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, otp, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.signupOtpExpire || user.signupOtpExpire < Date.now())
      return res.status(400).json({ message: "OTP expired or invalid" });

    if (user.signupOtpAttempts >= 5)
      return res.status(429).json({ message: "Too many attempts" });

    if (hashOtp(otp) !== user.signupOtp) {
      user.signupOtpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!isStrongPassword(password))
      return res.status(400).json({ message: "Weak password" });

    user.firstName = firstName;
    user.lastName = lastName;
    user.password = await bcrypt.hash(password, 10);
    user.isVerified = true;

    user.signupOtp = null;
    user.signupOtpExpire = null;
    user.signupOtpAttempts = 0;
    user.signupOtpResendAt = null;

    await user.save();

    res.json({ success: true, message: "Account created successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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

    const token = generateToken(user);


    user.isLoggedIn = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || "/download.png"
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
    const userId = req.user._id;

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
    if (!canResendOtp(user.resetOtpResendAt))
      return res.status(429).json({ message: "Wait 30 seconds" });

    const otp = generateOtp();

    user.resetOtp = hashOtp(otp);
    user.resetOtpExpire = otpExpireTime(10);
    user.resetOtpAttempts = 0;
    user.resetOtpResendAt = new Date();

    await user.save();
    await sendOtpEmail(email, otp, "Ecart Password Reset OTP")

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
    const user = await User.findOne({ email });
    if (!user || user.resetOtpExpire < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    if (user.resetOtpAttempts >= 5)
      return res.status(429).json({ message: "Too many attempts" });

    if (hashOtp(otp) !== user.resetOtp) {
      user.resetOtpAttempts++;
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number and special character"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10); // pre-save hook handle karega
    user.resetOtp = null;
    user.resetOtpExpire = null;
    user.resetOtpAttempts = 0;
    user.resetOtpResendAt = null;

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
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "Already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = hashOtp(otp);

    user.signupOtp = hashedOtp;
    user.signupOtpExpire = Date.now() + 5 * 60 * 1000;
    user.signupOtpAttempts = 0;

    await user.save({ validateBeforeSave: false });

    await sendOtpEmail(
      email,
      otp,
      "Ecart Signup OTP (Resent)"
    );

    return res.json({
      success: true,
      message: "OTP resent successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
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

    user.resetOtp = hashOtp(otp);
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
// controllers/adminController.js
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email mobile role createdAt isBlocked");

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const toggleBlockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
  });
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "User deleted" });
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
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ BASIC FIELDS
    const fields = ["firstName", "lastName", "phoneNo", "city", "pinCode"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // ✅ ADDRESS (IMPORTANT FIX)
    if (req.body.address) {
      if (user.addresses && user.addresses.length > 0) {
        user.addresses[0].address = req.body.address;
      } else {
        user.addresses = [
          {
            address: req.body.address,
            city: req.body.city,
            pinCode: req.body.pinCode,
          },
        ];
      }
    }

    // ✅ AVATAR
    if (req.file) {
      await cloudinary.uploader.destroy(user.profilePicPublicId);

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "ecart/users",
        public_id: user.profilePicPublicId,
      });

      user.profilePic = result.secure_url;
      user.profilePicPublicId = result.public_id;
    }

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Profile update failed" });
  }
};



export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.json({ success: false });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(401).json({ success: false });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user, // ✅ role included
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.params.id })
    .populate("orderItems.product", "title price");

  res.json({ success: true, orders });
};


