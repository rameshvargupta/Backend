import { Review } from "../models/reviewModel.js";
import { Product } from "../models/Product.js";
import OrderModel from "../models/OrderModel.js";

/* ================= HELPER FUNCTION ================= */
const recalculateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });

  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0,
    });
    return;
  }

  const avgRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    rating: Number(avgRating.toFixed(1)), // ⭐ one decimal
    numReviews: reviews.length,
  });
};

/* ================= ADD REVIEW ================= */
export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user._id;

    const order = await OrderModel.findOne({
      user: userId,
      orderStatus: "Delivered",
      "orderItems.productId": productId,
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "You can only review delivered products you purchased",
      });
    }

    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }
    const review = await Review.create({
      product: productId,
      user: userId,
      rating: Number(rating), // safety
      comment,
    });

    await OrderModel.updateOne(
      {
        user: userId,
        "orderItems.productId": productId,
      },
      {
        $set: { "orderItems.$.isReviewed": true },
      }
    );

    await recalculateProductRating(productId);

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
};

/* ================= UPDATE REVIEW ================= */
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }


    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    review.rating = rating ? Number(rating) : review.rating;
    review.comment = comment ?? review.comment;

    await review.save();
    await recalculateProductRating(review.product);

    res.json({
      success: true,
      message: "Review updated successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= DELETE REVIEW ================= */
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // ✅ Authorization check
    const isOwner =
      review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const productId = review.product;
    const userId = review.user;

    // ✅ 1. Delete review FIRST
    await review.deleteOne();

    // ✅ 2. Reset isReviewed flag in all matching order items
    await OrderModel.updateMany(
      {
        user: userId,
        "orderItems.productId": productId,
      },
      {
        $set: { "orderItems.$[elem].isReviewed": false },
      },
      {
        arrayFilters: [{ "elem.productId": productId }],
      }
    );

    // ✅ 3. Recalculate product rating AFTER delete
    await recalculateProductRating(productId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
