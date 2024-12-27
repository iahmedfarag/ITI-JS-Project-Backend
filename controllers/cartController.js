import Cart from "../Models/Cart.js";
import Product from "../Models/Product.js";

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

    return { price, priceAfterDiscount };
};

// Add product to cart
export const addToCart = async (req, res) => {
    const { productId } = req.body; // Quantity is no longer needed as we're adding only 1
    const userId = req.user.userId;

    try {
        // Validate input
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "ProductId is required.",
            });
        }

        // Find or create the cart for the user
        const cart = await Cart.findOneAndUpdate(
            { user: userId },
            { $setOnInsert: { user: userId, items: [] } }, // Initialize cart if it doesn't exist
            { upsert: true, new: true }
        ).populate("items.product"); // Populate product details

        // No need to call populate again; it's already populated above

        // Check if the product already exists in the cart
        const existingItem = cart.items.find((item) => item.product._id.toString() === productId);

        console.log(existingItem, "existingItem");

        if (existingItem) {
            // If the product is already in the cart, inform the user
            return res.status(200).json({
                success: false,
                message: "Product is already in the cart. Please modify the quantity on the cart page.",
            });
        }

        // Fetch the product details
        const product = await Product.findById(productId);
        console.log(product, "product");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        // Validate against available stock
        if (product.quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Sorry, this product is out of stock.",
            });
        }

        // Add the product to the cart with quantity 1
        cart.items.push({ product: productId, quantity: 1 });

        // Recalculate price and priceAfterDiscount
        const { price, priceAfterDiscount } = calcPrice(cart.items);
        cart.price = price;
        cart.priceAfterDiscount = priceAfterDiscount;

        // Save the updated cart
        await cart.save();

        // Optionally, repopulate to ensure all product details are up-to-date
        await cart.populate("items.product");

        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error("Error adding to cart:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid productId or quantity.",
        });
    }

    try {
        // Find the user's cart and populate product details
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found.",
            });
        }
        console.log(cart, "cart");

        // Find the existing item in the cart
        const existingItem = cart.items.find((item) => item.product._id.toString() === productId);
        console.log(existingItem, "existingItem in cart");

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart.",
            });
        }

        const product = existingItem.product;

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product details not found.",
            });
        }

        // Validate the requested quantity against available stock
        if (quantity > product.quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.quantity} units of this product are available.`,
            });
        }

        // Update the item's quantity in the cart
        existingItem.quantity = Number(quantity);

        // Recalculate price and priceAfterDiscount
        const { price, priceAfterDiscount } = calcPrice(cart.items);
        cart.price = price;
        cart.priceAfterDiscount = priceAfterDiscount;

        // Save the updated cart
        await cart.save();

        // Optionally, repopulate to ensure all product details are up-to-date
        await cart.populate("items.product");

        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error("Error updating cart item:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove product from cart
export const removeFromCart = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!productId) {
        return res.status(400).json({
            success: false,
            message: "ProductId is required.",
        });
    }

    try {
        // Find the user's cart and populate product details
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found.",
            });
        }
        console.log(cart, "cart");

        // Find the existing item in the cart
        const existingItem = cart.items.find((item) => item.product._id.toString() === productId);
        console.log(existingItem, "existingItem in cart");

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart.",
            });
        }

        // Remove the product from the cart
        cart.items = cart.items.filter((item) => item.product._id.toString() !== productId);

        // Recalculate price and priceAfterDiscount
        const { price, priceAfterDiscount } = calcPrice(cart.items);
        cart.price = price;
        cart.priceAfterDiscount = priceAfterDiscount;

        // Save the updated cart
        await cart.save();

        // Optionally, repopulate to ensure all product details are up-to-date
        await cart.populate("items.product");

        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error("Error removing from cart:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get cart
export const getCart = async (req, res) => {
    const userId = req.user.userId;

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
