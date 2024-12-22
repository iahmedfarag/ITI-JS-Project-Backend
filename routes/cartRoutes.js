import express from "express";
import { addToCart, getCart, updateCartItem, removeFromCart } from "../controllers/cartController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", auth, addToCart); // Add product to cart
router.get("/", auth, getCart); // Get cart
router.put("/", auth, updateCartItem); // Update cart item quantity
router.delete("/", auth, removeFromCart); // Remove product from cart

export default router;
