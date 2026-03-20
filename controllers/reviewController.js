import { Review } from "../models/reviewModel.js";
import OrderModel from "../models/OrderModel.js";
import { Product } from "../models/Product.js";
import mongoose from "mongoose";


export const addProductReview = async (req, res) => {
  try {

    const { rating, comment } = req.body;
    const { productId } = req.params;

    const userId = req.user._id;

    /* ================= VALIDATE INPUT ================= */

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required"
      });
    }

    /* ================= CHECK PRODUCT EXISTS ================= */

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    /* ================= FIND DELIVERED ORDER ================= */

    const order = await OrderModel.findOne({
      user: userId,
      orderStatus: "Delivered",
      orderItems: {
        $elemMatch: {
          productId: new mongoose.Types.ObjectId(productId)
        }
      }
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "You can only review delivered products"
      });
    }

    /* ================= CHECK ALREADY REVIEWED ================= */

    const alreadyReviewed = await Review.findOne({
      user: userId,
      product: productId
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product"
      });
    }

    /* ================= CREATE REVIEW ================= */

    const review = await Review.create({
      product: productId,
      user: userId,
      orderId: order._id,
      rating,
      comment,
      status: "pending" // ✅ important
    });

    /* ================= MARK ORDER ITEM REVIEWED ================= */

    /* ================= MARK ORDER ITEM REVIEWED ================= */
    const item = order.orderItems.find((i) => i.productId.toString() === productId);
    if (item) {
      item.isReviewed = true;
      await order.save();
    }

    /* ================= UPDATE PRODUCT RATING ================= */

    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId)
        }
      },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    await Product.findByIdAndUpdate(productId, {
      rating: stats[0]?.avgRating || 0,
      numReviews: stats[0]?.count || 0
    });

    /* ================= RESPONSE ================= */

    res.status(201).json({
      success: true,
      message: "Review submitted. Waiting for admin approval.",
      review
    });

  } catch (error) {

    console.error("REVIEW ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add review"
    });

  }
};

export const updateProductReview = async (req, res) => {
  try {

    const { rating, comment } = req.body;
    const userId = req.user._id;

    const review = await Review.findOne({
      _id: req.params.id,
      user: userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    review.status = "pending";

    await review.save();

    /* 🔥 IMPORTANT FIX */
    const productId = review.product;

    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          status: "approved"
        }
      },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    await Product.findByIdAndUpdate(productId, {
      rating: stats.length > 0 ? stats[0].avgRating : 0,
      numReviews: stats.length > 0 ? stats[0].count : 0
    });

    res.status(200).json({
      success: true,
      message: "Review updated & sent for re-approval",
      review
    });

  } catch (error) {
    console.error("UPDATE REVIEW ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update review"
    });
  }
};

export const deleteProductReview = async (req, res) => {
  try {

    const userId = req.user._id;

    /* ================= FIND REVIEW ================= */
    const review = await Review.findOne({
      _id: req.params.id,
      user: userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    const productId = review.product; // ✅ FIX HERE

    /* ================= FIND ORDER ================= */
    const order = await OrderModel.findById(review.orderId);

    /* ================= DELETE REVIEW ================= */
    await Review.deleteOne({ _id: review._id });

    /* ================= UPDATE ORDER ITEM ================= */
    if (order) {
      const item = order.orderItems.find(
        (i) => i.productId.toString() === productId.toString()
      );

      if (item) {
        item.isReviewed = false;
        await order.save();
      }
    }

    /* ================= UPDATE PRODUCT RATING ================= */
    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          status: "approved"
        }
      },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    await Product.findByIdAndUpdate(productId, {
      rating: stats.length > 0 ? stats[0].avgRating : 0,
      numReviews: stats.length > 0 ? stats[0].count : 0
    });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (error) {

    console.error("DELETE REVIEW ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete review"
    });

  }
};

export const getMyReview = async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id).lean();

    if (!order) {
      return res.status(404).json({ success: false });
    }

    // 🔥 ADD THIS BLOCK
    const productIds = order.orderItems.map(i => i.productId);

    const reviews = await Review.find({
      user: req.user._id,
      product: { $in: productIds }
    }).lean();

    // 🔥 MAP REVIEWS INTO ORDER ITEMS
    order.orderItems = order.orderItems.map(item => {
      const review = reviews.find(
        r => r.product.toString() === item.productId.toString()
      );

      return {
        ...item,
        userReview: review || null
      };
    });

    res.json({
      success: true,
      order
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// for get all admin axcess reviews here

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: "user",
        // 'name' ko hata kar firstName lastName rakha hai
        select: "firstName lastName email profilePic"
      })
      .populate({
        path: "product",
        select: "name images slug"
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      reviews // Frontend isi key ko expect kar raha hai
    });
  } catch (error) {
    console.error("ADMIN FETCH ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// getPendingReviews
export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: "pending" })
      .populate({
        path: "user",
        select: "firstName lastName email profilePic"
      })
      .populate({
        path: "product",
        select: "name images slug"
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, reviews });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const approveReview = async (req, res) => {
  try {
    // 1. Review ko ID se dhundiye
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found with this ID"
      });
    }

    // 2. Status update karein
    review.status = "approved";
    await review.save();

    /* ================= UPDATE PRODUCT RATING ================= */
    // Ensure review.product ek valid ObjectId hai
    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(review.product), // Convert to ObjectId
          status: "approved"
        }
      },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    await Product.findByIdAndUpdate(review.product, {
      rating: stats.length > 0 ? stats[0].avgRating : 0,
      numReviews: stats.length > 0 ? stats[0].count : 0
    });

    res.json({ success: true, message: "Review approved and rating updated" });
  } catch (error) {
    console.error("APPROVE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const rejectReview = async (req, res) => {

  try {

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    review.status = "rejected";

    await review.save();

    res.json({
      success: true,
      message: "Review rejected"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};

export const adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    /* ================= FIND REVIEW ================= */
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    const productId = review.product;


    /* ================= DELETE REVIEW ================= */
    await Review.findByIdAndDelete(id);

    /* ================= OPTIONAL: UPDATE ORDER ITEM ================= */
    if (review.orderId) {
      const order = await OrderModel.findById(review.orderId);

      if (order) {
        const item = order.orderItems.find(
          (i) => i.productId.toString() === productId.toString()
        );

        if (item) {
          item.isReviewed = false;
          await order.save();
        }
      }
    }

    /* ================= RECALCULATE PRODUCT RATING ================= */
    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          status: "approved" // ✅ important
        }
      },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    await Product.findByIdAndUpdate(productId, {
      rating: stats.length > 0 ? stats[0].avgRating : 0,
      numReviews: stats.length > 0 ? stats[0].count : 0
    });

    /* ================= RESPONSE ================= */
    res.json({
      success: true,
      message: "Review deleted by admin successfully"
    });

  } catch (error) {
    console.error("ADMIN DELETE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
// sow public reviews and only user reviews
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const userId = req.user?._id || null;

    const query = {
      product: productId,
      ...(userId
        ? {
            $or: [
              { status: "approved" },
              { user: userId }
            ],
          }
        : { status: "approved" }),
    };

    const reviews = await Review.find(query)
      .populate("user", "firstName lastName profilePic")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      reviews,
    });

  } catch (error) {
    console.error("GET PRODUCT REVIEWS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};