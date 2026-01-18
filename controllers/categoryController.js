import { Category } from "../models/categoryModel.js";

/* ✅ CREATE CATEGORY (ADMIN) */
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name)
      return res.status(400).json({ success: false, message: "Category name required" });

    const exists = await Category.findOne({ name });
    if (exists)
      return res.status(400).json({ success: false, message: "Category already exists" });

    const category = await Category.create({ name });

    res.status(201).json({
      success: true,
      message: "Category created",
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ✅ GET ALL CATEGORIES (USER + ADMIN) */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

