// Import necessary models
import Cart from "../Models/Cart.js";
import Product from "../Models/Product.js";
import Order from "../Models/Order.js";

const calcPrice = (items) => {
    let price = 0;
    let priceAfterDiscount = 0;

    items.forEach((item) => {
        const { price: unitPrice = 0, discount = 0 } = item.product || {};
        const quantity = item.quantity || 0;

        if (isNaN(unitPrice) || isNaN(discount) || isNaN(quantity)) {
            console.error("Invalid product data:", item);
            return; // Skip invalid item
        }

        price += unitPrice * quantity;
        priceAfterDiscount += unitPrice * (1 - discount / 100) * quantity;
    });

    const totalDiscount = price - priceAfterDiscount;

    return { price, priceAfterDiscount, totalDiscount };
};

export const checkout = async (req, res) => {
    const userId = req.user.userId; // Extract userId from token

    // Destructure necessary fields from request body
    const { name, email, address, phone, paymentMethod } = req.body;

    // Basic input validation
    if (!name || !email || !address || !phone) {
        return res.status(400).json({
            success: false,
            message: "All fields (name, email, address, phone) are required.",
        });
    }

    try {
        // Fetch the user's cart and populate product details
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty." });
        }

        console.log("Cart Items:", cart.items);

        // Calculate total price and price after discount
        const { price, priceAfterDiscount, totalDiscount } = calcPrice(cart.items);
        console.log(`Total Price: ${price}, Total After Discount: ${priceAfterDiscount}, Total Discount: ${totalDiscount}`);

        // Validate each item's stock before proceeding
        for (const item of cart.items) {
            const product = item.product;
            if (item.quantity > product.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.quantity} units of "${product.name}" are available.`,
                });
            }
        }

        // Create the order
        const order = await Order.create({
            user: userId,
            items: cart.items.map((item) => ({
                product: item.product._id,
                quantity: item.quantity,
            })),
            name,
            email,
            address,
            phone,
            paymentMethod: paymentMethod || "cash",
            price,
            priceAfterDiscount,
            discount: totalDiscount,
        });

        console.log("Order Created:", order);

        // Deduct the purchased quantities from each product's stock
        const updateStockPromises = cart.items.map((item) => {
            return Product.findByIdAndUpdate(item.product._id, {
                $inc: { quantity: -item.quantity },
            });
        });

        await Promise.all(updateStockPromises);
        console.log("Product stock updated successfully.");

        // Clear the user's cart after successful order creation
        await Cart.deleteOne({ user: userId });
        console.log("Cart cleared successfully.");

        // Respond with the created order details
        res.status(201).json({ success: true, order });
    } catch (error) {
        console.error("Error during checkout:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
};

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

        if (req.user.role !== "admin" && req.user.userId !== order.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
