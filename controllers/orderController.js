import Order from "../models/OrderModel.js";

export const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, totalAmount } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No order items",
            });
        }

        const order = await Order.create({
            user: req.user._id, // 🔥 must match schema
            orderItems,
            shippingAddress,
            totalAmount,
        });
       

        res.status(201).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
