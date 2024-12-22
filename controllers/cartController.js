import Cart from "../Models/Cart.js";
import Product from "../Models/Product.js";

// Add product to cart
export const addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body; // Extract userId, productId, and quantity from body
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const cart = await Cart.findOne({ user: userId }); // Find the user's cart

        if (cart) {
            // Check if the product already exists in the cart
            const existingItem = cart.items.find((item) => item.product.toString() === productId);

            if (existingItem) {
                // If the product exists, increase its quantity (ensure numeric addition)
                existingItem.quantity += Number(quantity);
            } else {
                // If the product doesn't exist, add it to the cart
                cart.items.push({ product: productId, quantity });
            }

            await cart.save(); // Save the updated cart
        } else {
            // If the cart doesn't exist, create a new one
            await Cart.create({
                user: userId,
                items: [{ product: productId, quantity }],
            });
        }

        const updatedCart = await Cart.findOne({ user: userId }).populate("items.product");

        res.status(200).json({ success: true, cart: updatedCart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get cart
export const getCart = async (req, res) => {
    const { userId } = req.body;
    try {
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart) {
            return res.status(200).json({ success: true, cart: null });
        }

        res.status(200).json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
    const { userId, productId, quantity } = req.body; // Extract userId, productId, and quantity from body
    try {
        const cart = await Cart.findOneAndUpdate(
            { user: userId, "items.product": productId }, // Use userId from the request body
            {
                $set: { "items.$.quantity": quantity },
            },
            { new: true }
        ).populate("items.product");

        res.status(200).json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove product
export const removeFromCart = async (req, res) => {
    const { userId, productId } = req.body; // Extract userId and productId from body
    try {
        const cart = await Cart.findOneAndUpdate(
            { user: userId }, // Use userId from the request body
            { $pull: { items: { product: productId } } }, // Remove specific product
            { new: true }
        ).populate("items.product");

        res.status(200).json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
