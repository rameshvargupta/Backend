
import { generateInvoicePDF } from "../utils/generateInvoicePDF.js";
import Order from "../models/OrderModel.js";
import { User } from "../models/userModel.js";

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

    // 🔥 Map order items to include slug
    const itemsWithSlug = orderItems.map(item => ({
      productId: item.productId,
      name: item.name,
      slug: item.slug, // 🔥 include slug
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    // ✅ Create order in DB
    const order = await Order.create({
      user: user._id,
      orderItems: itemsWithSlug,
      addresses: {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        city: selectedAddress.city,
        pincode: selectedAddress.pincode,
        state: selectedAddress.state,
      },
      totalAmount,
      paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Completed",
      orderStatus: "Pending",
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
            .populate("user", "firstName lastName email role addresses createdAt")
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

/* ========== ADMIN UPDATE ORDER STATUS ========== */
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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
      .populate("user", "firstName lastName email role");

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
