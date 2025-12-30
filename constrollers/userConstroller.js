import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyEmail } from "../emailVerify/verifyEmail.js";

/**
 * REGISTER USER
 */
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1️⃣ Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // 2️⃣ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    // 5️⃣ Generate email verification token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "10m" }
    );

    // 6️⃣ Save token in DB (optional but useful)
    newUser.token = token;
    await newUser.save();

    // 7️⃣ Send verification email
    await verifyEmail(token, email);

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      token
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//  EMAIL VERIFY

export const verifyUserEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token"
      });
    }

    user.isVerified = true;
    user.token = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Token expired or invalid"
    });
  }
};


//  EMAIL REVERIFY
// export const reVerifyEmail = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email })
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "User Not Found"
//       })
//     }
//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.SECRET_KEY,
//       { expiresIn: "10m" }
//     );

//     // 6️⃣ Save token in DB (optional but useful)
//     user.token = token;
//     await user.save();
//     return res.status(201).json({
//       success: true,
//       message: "User verification email send again successfully."
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// } 


export const reVerifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 3️⃣ Already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified"
      });
    }

    // 4️⃣ Generate fresh token
    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "10m" }
    );

    // 5️⃣ Save token (overwrite old one)
    user.token = token;
    await user.save();

    // 6️⃣ Send verification email
    await verifyEmail(token, email);

    return res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
      token
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
