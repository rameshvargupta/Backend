import { Product } from "../models/Product.js";
import { Category } from "../models/categoryModel.js";
import cloudinary from "../utils/cloudinary.js";
import slugify from "slugify";

export const addProduct = async (req, res) => {
  try {
    const { name, description, price, discountPrice, stock, category } = req.body;

    if (!name || !description || !price || !category)
      return res.status(400).json({ success: false, message: "All required fields missing" });
   
    if (discountPrice && Number(discountPrice) >= Number(price)) {
      return res.status(400).json({
        success: false,
        message: "Discount price must be less than price",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists)
      return res.status(400).json({ success: false, message: "Invalid category" });

    const slug = slugify(name, { lower: true });
    const existing = await Product.findOne({ slug });
    if (existing)
      return res.status(409).json({ success: false, message: "Product already exists" });

    // 🔥 Upload images to cloudinary
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "ecart/products",
        });

        images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      stock: stock ? Number(stock) : 0,
      category,
      images,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });

  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
