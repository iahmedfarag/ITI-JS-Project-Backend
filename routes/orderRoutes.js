import express from "express";
import { checkout, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

router.post("/checkout", checkout); // Checkout route
router.put("/status", updateOrderStatus); // Update order status

export default router;
