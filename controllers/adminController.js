import Order from "../models/OrderModel.js";
import { User } from "../models/userModel.js";

export const getDashboardStats = async (req, res) => {
  try {
    // TOTAL ORDERS
    const totalOrders = await Order.countDocuments();

    // TOTAL USERS
    const totalUsers = await User.countDocuments({ role: "user" });

    // TOTAL TRANSACTIONS (paid orders)
    const totalTransactions = await Order.countDocuments({
      paymentStatus: "Completed",
    });

    // TOTAL REVENUE (only completed payments)
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: "Completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue =
      revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    res.json({
      success: true,
      stats: {
        orders: totalOrders,
        users: totalUsers,
        transactions: totalTransactions,
        income: totalRevenue,
      },
    });
  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
