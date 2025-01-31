import Category from "../Models/Category.js";
import Product from "../Models/Product.js";
import cloudinary from "../services/cloudinary.js";
import { uploadToCloudinary } from "../utils/cloudinaryHelper.js";

/**
 * Create a new product with images uploaded to Cloudinary
 */
export const createProduct = async (req, res) => {
    try {
        // Allow only admins
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const { name, description, price, discount, quantity, isFeatured, category } = req.body;

        // Validate category existence
        const categoryObj = await Category.findById(category);
        if (!categoryObj) {
            return res.status(404).json({ error: "Category not found" });
        }

        // Temporarily create a product to get its ID
        const tempProduct = new Product({
            name,
            description,
            price,
            discount,
            quantity,
            mainImage: "temp", // Placeholder
            otherImages: [],
            isFeatured,
            category,
        });
        await tempProduct.save();

        // Create folder path based on category ID and product ID
        const folderPath = `ITI-JS-Project/${category}/${tempProduct._id}`;

        // Handle mainImage upload (REQUIRED)
        let mainImageUrl = null;
        if (req.files?.mainImage && req.files.mainImage[0]) {
            const mainImgResult = await uploadToCloudinary(req.files.mainImage[0].buffer, folderPath);
            mainImageUrl = mainImgResult.secure_url;
        } else {
            // Roll back the temp product creation if no mainImage is provided
            await Product.findByIdAndDelete(tempProduct._id);
            return res.status(400).json({ error: "Main image is required" });
        }

        // Handle otherImages upload (OPTIONAL)
        let otherImagesUrls = [];
        if (req.files?.otherImages && req.files.otherImages.length) {
            for (const file of req.files.otherImages) {
                const result = await uploadToCloudinary(file.buffer, folderPath);
                otherImagesUrls.push(result.secure_url);
            }
        }

        // Update product with image URLs
        tempProduct.mainImage = mainImageUrl;
        tempProduct.otherImages = otherImagesUrls;
        await tempProduct.save();

        // Add product reference to category
        await Category.findByIdAndUpdate(category, {
            $push: { products: tempProduct._id },
        });

        res.status(201).json({ message: "Product created", product: tempProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get all products
 */
export const getAllProducts = async (req, res) => {
    try {
        // Optionally populate category
        const products = await Product.find().populate("category");
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get product by ID
 */
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category");
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update a product
 */
export const updateProduct = async (req, res) => {
    try {
        // Allow only admins
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const { name, description, price, discount, quantity, isFeatured, category } = req.body;

        // Find the product
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });

        // If category is updated, validate the new category
        if (category && category !== product.category.toString()) {
            const categoryObj = await Category.findById(category);
            if (!categoryObj) {
                return res.status(404).json({ error: "New category not found" });
            }
        }

        // Create folder path based on category ID and product ID
        const folderPath = `ITI-JS-Project/${category || product.category}/${product._id}`;

        // Handle mainImage upload
        let mainImageUrl = product.mainImage;
        if (req.files?.mainImage && req.files.mainImage[0]) {
            const mainImgResult = await uploadToCloudinary(req.files.mainImage[0].buffer, folderPath);
            mainImageUrl = mainImgResult.secure_url;
        }

        // Handle otherImages upload
        let otherImagesUrls = product.otherImages;
        if (req.files?.otherImages && req.files.otherImages.length) {
            otherImagesUrls = [];
            for (const file of req.files.otherImages) {
                const result = await uploadToCloudinary(file.buffer, folderPath);
                otherImagesUrls.push(result.secure_url);
            }
        }

        const updateFields = {
            name: name || product.name,
            description: description || product.description,
            price: price || product.price,
            discount: discount || product.discount,
            quantity: quantity || product.quantity,
            isFeatured: isFeatured !== undefined ? isFeatured : product.isFeatured,
            category: category || product.category,
            mainImage: mainImageUrl,
            otherImages: otherImagesUrls,
        };

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateFields, {
            new: true,
            runValidators: true,
        });

        if (category && category !== product.category.toString()) {
            await Category.findByIdAndUpdate(product.category, { $pull: { products: product._id } });
            await Category.findByIdAndUpdate(category, { $push: { products: product._id } });
        }

        res.json({ message: "Product updated", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a product
 */
export const deleteProduct = async (req, res) => {
    try {
        // Allow only admins
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ error: "Product not found" });

        if (deletedProduct.category) {
            await Category.findByIdAndUpdate(deletedProduct.category, { $pull: { products: deletedProduct._id } });
        }

        const folderPath = `ITI-JS-Project/${deletedProduct.category}/${deletedProduct._id}`;
        await cloudinary.api.delete_resources_by_prefix(folderPath);
        await cloudinary.api.delete_folder(folderPath);

        res.json({ message: "Product and associated images deleted", product: deletedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
