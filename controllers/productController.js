import { Product } from "../models/Product.js";
import { Category } from "../models/categoryModel.js";
import cloudinary from "../utils/cloudinary.js";
import slugify from "slugify";
import mongoose from "mongoose";
import { deleteCloudinaryImages } from "../utils/cloudinaryDelete.js";
import { Review } from "../models/reviewModel.js";


export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      stock,
      category,
    } = req.body;

    // ================================
    // 1️⃣ Basic Validation
    // ================================
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory",
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    if (discountPrice && Number(discountPrice) >= Number(price)) {
      return res.status(400).json({
        success: false,
        message: "Discount price must be less than price",
      });
    }

    // ================================
    // 2️⃣ Validate Category
    // ================================
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    // ================================
    // 3️⃣ Slug Handling (Unique)
    // ================================
    let slug = slugify(name, { lower: true, strict: true });

    const slugExists = await Product.findOne({ slug });
    if (slugExists) {
      slug = slug + "-" + Date.now(); // make unique
    }

    // ================================
    // 4️⃣ Upload Images (Compressed)
    // ================================
    let images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "ecart/products",
          transformation: [
            {
              width: 800,
              crop: "limit",
              quality: "auto",
              format: "webp",
            },
          ],
        });

        images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // ================================
    // 5️⃣ Create Product
    // ================================
    const product = await Product.create({
      name,
      slug,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      stock: stock ? Number(stock) : 0,
      category,
      images,
      createdBy: req.user._id,
      isActive: true,
    });

    // ================================
    // 6️⃣ Response
    // ================================
    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });

  } catch (error) {
    console.error("Add Product Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProductsUser = async (req, res) => {
  try {
    let {
      category,
      sort,
      page = 1,
      limit = 12,
      minPrice,
      maxPrice,
      keyword
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = { isActive: true };

    // ✅ SEARCH FILTER
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ];
    }

    // ✅ Category Filter
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = new mongoose.Types.ObjectId(category);
    }

    // ✅ Price Filter
    if (minPrice || maxPrice) {
      query.finalPrice = {};
      if (minPrice) query.finalPrice.$gte = Number(minPrice);
      if (maxPrice) query.finalPrice.$lte = Number(maxPrice);
    }

    let productsQuery = Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    const products = await productsQuery
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get single product  user
export const getSingleProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({
      slug,
      isActive: true, // 🔐 user ko sirf active product
    }).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getSimilarProducts = async (req, res) => {
  try {
    const { productId, categoryId } = req.params;

    // ================================
    // 1️⃣ Validate ObjectIds
    // ================================
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(categoryId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product or category ID",
      });
    }

    // ================================
    // 2️⃣ Check if current product exists
    // ================================
    const currentProduct = await Product.findById(productId);


    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const products = await Product.find({
      category: currentProduct.category,
      _id: { $ne: productId },
      isActive: true,
    })
      .populate("category", "name")
      .sort({ createdAt: -1 }) // latest first
      .limit(6);

    // ================================
    // 4️⃣ Response
    // ================================
    res.status(200).json({
      success: true,
      total: products.length,
      products,
    });

  } catch (error) {
    console.error("Get Similar Products Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load similar products",
    });
  }
};


export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews"
    });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    const {
      name,
      price,
      discountPrice,
      stock,
      category,
      description,
      replaceImages, // 👈 frontend se boolean
    } = req.body;

    // ✅ basic updates
    if (name) {
      product.name = name;
      product.slug = slugify(name, { lower: true });
    }
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined)
      product.discountPrice = Number(discountPrice);
    if (stock) product.stock = stock;
    if (category) product.category = category;
    if (description) product.description = description;

    // 🔥 CASE 1: Replace all images
    if (replaceImages === "true") {
      // ❌ delete old images
      await deleteCloudinaryImages(product.images);
      product.images = [];
    }


    // 🔥 CASE 2: Add new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "ecart/products",
          transformation: [
            {
              width: 800,
              crop: "limit",
              quality: "auto",
              format: "webp",
            },
          ],
        });

        product.images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// permanent product delete
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    for (let img of product.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product permanently deleted",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getSingleProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ ObjectId validation (security)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id).populate(
      "category",
      "name"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });

  } catch (error) {
    console.error("Get Single Product Admin Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// soft product delete
export const toggleProductStatus = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  product.isActive = !product.isActive;
  await product.save();

  res.json({
    success: true,
    isActive: product.isActive,
  });
};

export const getProductBySlug = async (req, res) => {
  try {
    // 🔥 Populate category name
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category", "name"); // populate only the 'name' field

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


