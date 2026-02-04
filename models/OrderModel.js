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
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        productName: {
          type: String,
          required: true,
        },

        slug: String,

        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },

        categoryName: String,

        price: {
          type: Number,
          required: true,
        },

        discount: {
          type: Number,
          default: 0,
        },

        quantity: {
          type: Number,
          required: true,
        },

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

    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery", "Online"],
      required: true,
    },

    totalAmount: Number,

    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

  paymentMethod: {
  type: String,
  enum: ["Cash on Delivery", "Online Payment"],
  required: true,
},

paymentStatus: {
  type: String,
  enum: ["Pending", "Paid", "Failed"],
  default: "Pending",
},
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
