import { Review } from "../models/reviewModel.js";
import { Product } from "../models/Product.js";

/* ================= ADD REVIEW ================= */
export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product",
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
    });

    const reviews = await Review.find({ product: productId });
    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: reviews.length,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
};

/* ================= UPDATE REVIEW (ONLY OWNER) ================= */

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized" });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    await review.save();

    res.json({ success: true, message: "Review updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    const isOwner = review.user.toString() === req.user._id;
    const isAdmin = req.user.role === "admin";

    console.log("isOwner:", isOwner, "isAdmin:", isAdmin); // should log true for admin

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await review.deleteOne();
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

