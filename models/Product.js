import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    finalPrice: { type: Number },

    stock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },

    images: [
      {
        url: String,
        public_id: String,
      },
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: { type: Boolean, default: true },

  },

  { timestamps: true }
);

productSchema.pre("save", function () {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
  }

  this.finalPrice =
    this.discountPrice > 0
      ? this.price - this.discountPrice
      : this.price;
});


export const Product = mongoose.model("Product", productSchema);
