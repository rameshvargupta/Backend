import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      default: "percentage"
    },

    discountValue: {
      type: Number,
      required: true,
      min: 1
    },

    minOrderValue: {
      type: Number,
      default: 0
    },

    maxDiscount: {
      type: Number,
      default: 0
    },

    expiryDate: {
      type: Date,
      required: true
    },

    usageLimit: {
      type: Number,
      default: 0   // 0 = unlimited
    },

    usedCount: {
      type: Number,
      default: 0
    },

    perUserLimit: {
      type: Number,
      default: 1
    },
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        count: {
          type: Number,
          default: 1
        }
      }
    ],

    category: {
      type: String,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }

  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);

