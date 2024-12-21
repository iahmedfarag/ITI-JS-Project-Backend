import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";

// Import user routes
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const { PORT, MONGODB_URI } = process.env;

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Basic route
app.get("/", (req, res) => {
    res.send("Hello World with roles in ES modules!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
