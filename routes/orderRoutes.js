import express from "express";
import { checkout, updateOrderStatus, getAllOrders, getOrderById } from "../controllers/orderController.js";
import { auth } from "../middlewares/auth.js";

import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/checkout", auth, checkout); // Checkout route (protected)
router.get("/", auth, getAllOrders); // Get all orders (user or admin)
router.get("/:id", auth, getOrderById); // Get specific order (user or admin)
router.put("/status", auth, updateOrderStatus); // Update order status (admin protected)

export default router;
