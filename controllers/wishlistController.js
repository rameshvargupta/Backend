import mongoose from "mongoose";
import { User } from "../models/userModel.js";

/* ================= ADD TO WISHLIST ================= */
export const addToWishlist = async (req, res) => {
  try {
    const productId = req.params.productId; // ✅ FIRST define karo

    // ✅ Validate ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Prevent duplicate (IMPORTANT)
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    const updatedUser = await User.findById(req.user.id)
      .populate("wishlist");

    res.status(200).json({
      success: true,
      wishlist: updatedUser.wishlist,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ================= REMOVE FROM WISHLIST ================= */
export const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;

    // ✅ Validate ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Check exists
    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: "Item not in wishlist",
      });
    }

    user.wishlist.pull(productId);
    await user.save();

    const updatedUser = await User.findById(req.user.id)
      .populate("wishlist");

    res.status(200).json({
      success: true,
      wishlist: updatedUser.wishlist,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ================= GET WISHLIST ================= */
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      wishlist: user.wishlist,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};