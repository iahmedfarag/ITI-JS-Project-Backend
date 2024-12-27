import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
// Import user routes
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const { PORT, MONGODB_URI } = process.env;

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

// Basic route
app.get("/", (req, res) => {
    res.send("ITI-JS-PROJECT");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
