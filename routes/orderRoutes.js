import express from "express";
import { checkout, updateOrderStatus } from "../controllers/orderController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/checkout", auth, checkout); // Checkout route (protected)
router.put("/status", auth, updateOrderStatus); // Update order status (admin protected)

export default router;
