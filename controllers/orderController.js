
import { generateInvoicePDF } from "../utils/generateInvoicePDF.js";
import Order from "../models/OrderModel.js";
import { User } from "../models/userModel.js";
import { Product } from "../models/Product.js";
import { updateCouponUsage } from "./couponController.js";
import mongoose from "mongoose";
import { Review } from "../models/reviewModel.js";
import crypto from "crypto";
import CouponModel from "../models/CouponModel.js";

// 🔥 Delivery date calculation
const getDeliveryRange = (pincode) => {
  const today = new Date();
  let minDays = 4;
  let maxDays = 6;

  // Example smart logic: PIN starting with 22 => faster delivery
  if (pincode.startsWith("22")) {
    minDays = 2;
    maxDays = 4;
  }

  const min = new Date(today);
  min.setDate(today.getDate() + minDays);

  const max = new Date(today);
  max.setDate(today.getDate() + maxDays);

  return { min, max };
};


export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      selectedAddressId,
      paymentMethod,
      couponCode = null,
    } = req.body;

    if (!orderItems?.length) {
      return res.status(400).json({ success: false, message: "No order items" });
    }

    if (!selectedAddressId) {
      return res.status(400).json({ success: false, message: "Address required" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: "Payment method required" });
    }

    /* ================= USER ================= */
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const selectedAddress = user.addresses.find(
      (addr) => addr._id.toString() === selectedAddressId.toString()
    );

    if (!selectedAddress) {
      return res.status(400).json({ success: false, message: "Invalid address" });
    }

    /* ================= ITEMS ================= */
    let mrp = 0;
    let selling = 0;

    const items = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.productId || item._id)
        .populate("category", "name");

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      const quantity = Number(item.quantity || 1);

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} out of stock`,
        });
      }

      const originalPrice = product.price;

      // 🔥 SINGLE SOURCE OF TRUTH
      const finalPrice = product.finalPrice || product.price;

      mrp += originalPrice * quantity;
      selling += finalPrice * quantity;

      items.push({
        productId: product._id,
        productName: product.name,
        slug: product.slug,
        category: product.category?._id,
        categoryName: product.category?.name || "Unknown",

        originalPrice,
        price: finalPrice,
        discount: originalPrice - finalPrice,

        quantity,
        image: item.image,
      });
    }

    /* ================= COUPON (🔥 FIXED) ================= */
    let couponDiscount = 0;
    let couponDetails = null;

    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired coupon",
        });
      }

      // ✅ MIN ORDER CHECK
      if (selling < coupon.minOrderValue) {
        return res.status(400).json({
          success: false,
          message: `Minimum order ₹${coupon.minOrderValue}`,
        });
      }

      // ✅ CALCULATE
      if (coupon.discountType === "percentage") {
        couponDiscount = Math.floor(
          (selling * coupon.discountValue) / 100
        );
      } else {
        couponDiscount = coupon.discountValue;
      }

      // ✅ OPTIONAL MAX DISCOUNT LIMIT
      if (coupon.maxDiscount) {
        couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
      }

      couponDetails = {
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      };
    }

    /* ================= CALCULATIONS ================= */
    const SHIPPING_CHARGE = 40;
    const FREE_SHIPPING_THRESHOLD = 499;
    const PLATFORM_FEE = 5;

    const shipping = selling > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;

    const productDiscount = mrp - selling;

    const totalAmount =
      selling + shipping + PLATFORM_FEE - couponDiscount;

    const totalSavings = productDiscount + couponDiscount;

    /* ================= DELIVERY ================= */
    const expectedDelivery = getDeliveryRange(selectedAddress.pincode);

    /* ================= STOCK UPDATE ================= */
    await Promise.all(
      items.map((item) =>
        Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        })
      )
    );

    /* ================= CREATE ORDER ================= */
    const order = await Order.create({
      user: user._id,
      orderItems: items,
      addresses: selectedAddress,
      mrp,
      sellingPrice: selling,
      productDiscount,
      couponDiscount,
      shipping,
      platformFee: PLATFORM_FEE,
      totalAmount,
      totalSavings,
      paymentMethod: paymentMethod === "COD" ? "COD" : "ONLINE",
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Pending",
      expectedDelivery,
      couponCode,
      couponDetails,
    });

    /* ================= COUPON USAGE ================= */
    if (couponCode) {
      await updateCouponUsage(couponCode, user._id);
    }

    res.status(201).json({
      success: true,
      order,
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


export const verifyPaymentAndCreateOrder = async (req, res) => {
  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderItems,
      addressId,
      totalAmount,
      couponCode
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // ✅ VERIFIED

    const user = await User.findById(req.user._id);
    const selectedAddress = user.addresses.id(addressId);

    const items = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.productId);

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} out of stock`,
        });
      }

      // reduce stock
      product.stock -= item.quantity;
      await product.save();

      items.push({
        productId: product._id,
        productName: product.name,
        slug: product.slug,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      });
    }

    const order = await Order.create({
      user: user._id,
      orderItems: items,
      addresses: selectedAddress,
      totalAmount,
      paymentMethod: "ONLINE",
      paymentStatus: "Paid",
      orderStatus: "Confirmed",
      couponCode: couponCode || null,
      paidAt: new Date(),
      razorpayPaymentId: razorpay_payment_id,
    });

    if (couponCode) {
      await updateCouponUsage(couponCode, user._id);
    }

    res.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ✅ Ownership check
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // ✅ Allowed cancel stages
    const cancellableStatuses = ["Pending", "Processing", "Shipped"];

    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    // ❌ Already cancelled
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order already cancelled",
      });
    }

    // ✅ Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    // ✅ Update order
    order.orderStatus = "Cancelled";
    order.paymentStatus =
      order.paymentMethod === "COD" ? "Cancelled" : "Refund Initiated";

    order.cancelledAt = new Date();
    order.cancelReason = reason || "User cancelled";
    order.cancelledBy = "USER";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });

  } catch (error) {
    console.error("CANCEL ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling order",
    });
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
    const orders = await Order
      .find({ user: req.user._id })
      .sort({ createdAt: -1 }); // 🔥 newest first

    const ordersWithReviews = await Promise.all(
      orders.map(async (order) => {
        const updatedItems = await Promise.all(
          order.orderItems.map(async (item) => {
            const review = await Review.findOne({
              user: req.user._id,
              product: item.productId,
            });

            return {
              ...item.toObject(),
              userReview: review || null,
              isReviewed: !!review,
            };
          })
        );

        return {
          ...order.toObject(),
          orderItems: updatedItems,
        };
      })
    );

    res.status(200).json({
      success: true,
      orders: ordersWithReviews,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
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

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // ✅ SECURITY CHECK
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  // ✅ Only delivered orders
  if (order.orderStatus !== "Delivered") {
    return res.status(400).json({
      success: false,
      message: "Invoice available after delivery only",
    });
  }
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

    const { status, payment, category, timeSort, sortAmount } = req.query;
    const { orderId, orderStatus, paymentStatus } = req.body || {};

    // optional update support

    let query = {};

    // ================= FILTERS =================

    if (status && status !== "All") {
      query.orderStatus = status;
    }

    if (payment && payment !== "All") {
      query.paymentStatus = payment;
    }

    if (category && category !== "All") {
      query.orderItems = {
        $elemMatch: {
          category: new mongoose.Types.ObjectId(category),
        },
      };
    }

    // ================= SORTING =================

    let sortQuery = {};

    if (timeSort === "new") sortQuery.createdAt = -1;
    if (timeSort === "old") sortQuery.createdAt = 1;

    if (sortAmount === "low") sortQuery.totalAmount = 1;
    if (sortAmount === "high") sortQuery.totalAmount = -1;

    if (Object.keys(sortQuery).length === 0) {
      sortQuery = { createdAt: -1 };
    }

    // ================= OPTIONAL UPDATE =================
    // If admin sends orderId in body, update that order first

    if (orderId && (orderStatus || paymentStatus)) {
      let orderToUpdate = await Order.findById(orderId);

      if (!orderToUpdate) {
        return res.status(404).json({
          success: false,
          message: "Order not found for update",
        });
      }

      if (orderStatus) {
        orderToUpdate.orderStatus = orderStatus;

        if (orderStatus === "Delivered") {
          orderToUpdate.deliveredAt = Date.now();
        }
      }

      if (paymentStatus) {
        orderToUpdate.paymentStatus = paymentStatus;
      }

      await orderToUpdate.save();
    }

    // ================= FETCH ORDERS =================

    const orders = await Order.find(query)
      .populate({
        path: "user",
        select: "firstName lastName email role profilePic createdAt",
      })
      .populate("orderItems.productId", "name image slug")
      .populate("orderItems.category", "name")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);

    return res.status(200).json({
      success: true,
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    });

  } catch (error) {
    console.error("GET ALL ORDERS ADMIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
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

