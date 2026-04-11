import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        productName: { type: String, required: true },
        slug: String,
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        categoryName: String,
        price: { type: Number, required: true },
        originalPrice: Number, // 🔥 IMPORTANT
        discount: { type: Number, default: 0 },
        quantity: { type: Number, required: true },
        isReviewed: { type: Boolean, default: false },
        image: String,
      },
    ],

    addresses: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
      state: String,
    },

    paymentMethod: { type: String, enum: ["COD", "ONLINE"], required: true },

    /* 🔥 FULL PRICE BREAKDOWN (MAIN FIX) */
    mrp: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    productDiscount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },

    totalAmount: { type: Number, required: true },
    totalSavings: { type: Number, required: true },

    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    cancelledAt: Date,

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    expectedDelivery: {
      min: Date,
      max: Date,
    },

    couponCode: { type: String, default: null },

    couponDetails: {
      discountType: String,
      discountValue: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);