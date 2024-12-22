import express from "express";
import { addToCart, getCart, updateCartItem, removeFromCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/", addToCart);
router.get("/", getCart);
router.put("/", updateCartItem);
router.delete("/", removeFromCart);

export default router;
