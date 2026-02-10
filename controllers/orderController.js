
import { generateInvoicePDF } from "../utils/generateInvoicePDF.js";
import Order from "../models/OrderModel.js";
import { User } from "../models/userModel.js";
import { Product } from "../models/Product.js";

import mongoose from "mongoose";
/* ========== USER CREATE ORDER ========== */

export const createOrder = async (req, res) => {
  try {
    const { orderItems, selectedAddressId, totalAmount, paymentMethod } = req.body;

    // ✅ Validate order items
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items",
      });
    }

    // ✅ Validate selected address
    if (!selectedAddressId) {
      return res.status(400).json({
        success: false,
        message: "Address not selected",
      });
    }
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }


    // 🔥 Get logged-in user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔥 Find the selected address from user's addresses
    const selectedAddress = user.addresses.id(selectedAddressId);
    if (!selectedAddress) {
      return res.status(400).json({
        success: false,
        message: "Invalid address selected",
      });
    }
    const itemsWithSlug = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.productId)
          .populate("category", "name");

        return {
          productId: product._id,
          productName: product.name,
          slug: product.slug,

          category: product.category?._id,          // ✅ ObjectId
          categoryName: product.category?.name || "Unknown",

          price: item.price,
          discount: item.discount || 0,
          quantity: item.quantity,
          image: item.image,
        };
      })
    );


    // ✅ Create order in DB
    const order = await Order.create({
      user: user._id,
      orderItems: itemsWithSlug,
      addresses: selectedAddress,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Completed",
    });


    return res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ========== ADMIN GET ALL ORDERS ========== */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email phone")
      .populate("orderItems.productId", "name")
      .populate("orderItems.category", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


/* ========== ADMIN GET ALL USERS ========== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ✅ update order status
    if (orderStatus) {
      order.orderStatus = orderStatus;

      if (orderStatus === "Delivered") {
        order.deliveredAt = Date.now();
      }
    }

    // ✅ update payment status
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    // 🔥 populate AFTER save
    order = await Order.findById(order._id)
      .populate("orderItems.category", "name");

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("UPDATE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("orderItems.productId", "name price image");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ========== ADMIN GET ORDERS BY USER ID ========== */
export const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName email role")
      .populate("orderItems.productId", "name image") // populate product name and image
      .populate("orderItems.category", "name"); // populate category name

    res.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};



export const downloadInvoice = async (req, res) => {
  const order = await Order.findById(req.params.id);
  const user = await User.findById(order.user);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order._id}.pdf`
  );

  generateInvoicePDF(order, user, res);
};

/* ========== ADMIN GET ALL ORDERS WITH FILTER, SORT, PAGINATION ========== */
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // STATUS FILTER
    if (req.query.status && req.query.status !== "All") {
      query.orderStatus = req.query.status;
    }

    // PAYMENT FILTER
    if (req.query.payment && req.query.payment !== "All") {
      query.paymentStatus = req.query.payment;
    }

    // CATEGORY FILTER
    if (req.query.category && req.query.category !== "All") {
      query.orderItems = {
        $elemMatch: { category: mongoose.Types.ObjectId(req.query.category) }

      };
      console.log("Filtering by category:", req.query.category)
    }

    // SORTING
    let sortQuery = {};

    if (req.query.timeSort === "new") {
      sortQuery.createdAt = -1;
    }
    if (req.query.timeSort === "old") {
      sortQuery.createdAt = 1;
    }

    if (req.query.sortAmount === "low") {
      sortQuery.totalAmount = 1;
    }
    if (req.query.sortAmount === "high") {
      sortQuery.totalAmount = -1;
    }

    // fallback
    if (Object.keys(sortQuery).length === 0) {
      sortQuery = { createdAt: -1 };
    }

    console.log("Sort query:", sortQuery);
    // ✅ Debugging logs
    console.log("Query Params:", req.query);
    console.log("MongoDB Query Object:", query);
    console.log("Sort Object:", sortQuery, "Skip:", skip, "Limit:", limit);

    const orders = await Order.find(query)
      .populate("user", "firstName lastName email profilePic")
      .populate("orderItems.category", "name")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);

    orders.forEach(o => {
      console.log(
        "ORDER:",
        o._id.toString(),
        "createdAt:",
        o.createdAt,
        "amount:",
        o.totalAmount
      );
    });

    res.json({
      success: true,
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("GET ALL ORDERS ADMIN ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ========== ADMIN GET SINGLE USER ========== */
export const getUserByIdAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserStatsAdmin = async (req, res) => {
  const orders = await Order.find({ user: req.params.id });

  const totalSpent = orders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );

  res.json({
    success: true,
    totalOrders: orders.length,
    totalSpent,
  });
};


export const getLast30DaysSoldCount = async (req, res) => {
  const productId = req.params.id;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await Order.aggregate([
    {
      $match: {
        orderStatus: "Delivered",
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    { $unwind: "$orderItems" },
    {
      $match: {
        "orderItems.productId": new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: null,
        totalSold: { $sum: "$orderItems.quantity" },
      },
    },
  ]);

  res.json({
    success: true,
    soldLast30Days: result[0]?.totalSold || 0,
  });
};

