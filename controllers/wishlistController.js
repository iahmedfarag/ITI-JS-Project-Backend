import Wishlist from "../Models/Wishlist.js";

// Add product to wishlist
export const addToWishlist = async (req, res) => {
    const { productId } = req.body; // Extract productId from body
    const userId = req.user.userId; // Extract userId from token

    try {
        const wishlist = await Wishlist.findOneAndUpdate(
            { user: userId },
            { $addToSet: { products: productId } }, // Avoid duplicates
            { new: true, upsert: true }
        ).populate("products");

        res.status(200).json({ success: true, wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get wishlist
export const getWishlist = async (req, res) => {
    const userId = req.user.userId; // Extract userId from token

    try {
        const wishlist = await Wishlist.findOne({ user: userId }).populate("products");
        res.status(200).json({ success: true, wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
    const { productId } = req.body; // Extract productId from body
    const userId = req.user.userId; // Extract userId from token

    try {
        const wishlist = await Wishlist.findOneAndUpdate(
            { user: userId },
            { $pull: { products: productId } }, // Remove specific product
            { new: true }
        ).populate("products");

        res.status(200).json({ success: true, wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
