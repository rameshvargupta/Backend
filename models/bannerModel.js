import mongoose from "mongoose";

const bannerImageSchema = new mongoose.Schema({
  imageUrl: String,
  imageId: String, // cloudinary public_id
});

const bannerSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      enum: ["TOP", "MIDDLE", "BOTTOM"],
      required: true,
      unique: true, // ONE document per carousel
    },
    images: {
      type: [bannerImageSchema],
      validate: [arr => arr.length <= 5, "Max 5 images allowed"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
