import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlistController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", auth, addToWishlist); // Add product to wishlist (protected)
router.get("/", auth, getWishlist); // Get wishlist (protected)
router.delete("/", auth, removeFromWishlist); // Remove product from wishlist (protected)

export default router;
