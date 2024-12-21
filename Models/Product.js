import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
    },
    discount: {
        type: Number,
        default: 0,
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
    },
    mainImage: {
        type: String, // Cloudinary URL
        required: [true, "Image is required"],
    },
    otherImages: [
        {
            type: String, // Cloudinary URLs for additional images
        },
    ],
    isFeatured: {
        type: Boolean,
        default: false,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"],
    },
});

export default mongoose.model("Product", productSchema);
