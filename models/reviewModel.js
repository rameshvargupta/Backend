import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    /* ⭐ Order reference (very important) */
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },

    /* ⭐ Rating */
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    /* ⭐ Review text */
    comment: {
      type: String,
      required: true,
      trim: true
    },


    /* ⭐ Verified purchase badge */
    isVerifiedPurchase: {
      type: Boolean,
      default: true
    },

    /* ⭐ Admin moderation */
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    moderatedAt: {
      type: Date
    },

    /* ⭐ Helpful votes (future feature) */
    helpfulVotes: {
      type: Number,
      default: 0
    }

  },
  { timestamps: true }
);

/* ⭐ Prevent multiple reviews per user */
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);