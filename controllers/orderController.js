import Cart from "../Models/Cart.js";
import Order from "../Models/Order.js";

// Checkout Cart and Create Order
export const checkout = async (req, res) => {
    const userId = req.user.userId; // Extract userId from token

    try {
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // Create an order with the cart items
        const order = await Order.create({
            user: userId,
            items: cart.items, // Copy items from the cart
        });

        // Delete the cart after transferring its data to the order
        await Cart.deleteOne({ user: userId });

        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
    const { orderId, status } = req.body; // Extract orderId and status from the request body

    try {
        // Allow only admins to update order status
        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied. Admins only." });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check for valid status
        if (!["pending", "approved", "declined", "completed"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        order.status = status;
        order.updatedAt = Date.now();
        await order.save();

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        let orders;

        // Admin: Fetch all orders
        if (req.user.role === "admin") {
            orders = await Order.find().populate("items.product").populate("user", "email");
        } else {
            // User: Fetch only their orders
            orders = await Order.find({ user: req.user.userId }).populate("items.product");
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getOrderById = async (req, res) => {
    const { id } = req.params; // Order ID from route params

    try {
        const order = await Order.findById(id).populate("items.product").populate("user", "email");

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Allow access if the user is admin or the owner of the order
        if (req.user.role !== "admin" && req.user.userId !== order.user.toString()) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
