import { User } from "../models/userModel.js";

/* ================= ADD TO WISHLIST ================= */
export const addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const productId = req.params.productId;

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    const updatedUser = await User.findById(req.user.id).populate("wishlist");

    res.status(200).json({
      success: true,
      wishlist: updatedUser.wishlist,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* ================= REMOVE FROM WISHLIST ================= */
export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.wishlist.pull(req.params.productId);
    await user.save();

    const updatedUser = await User.findById(req.user.id).populate("wishlist");

    res.status(200).json({
      success: true,
      wishlist: updatedUser.wishlist,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* ================= GET WISHLIST ================= */
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    res.status(200).json({
      success: true,
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};