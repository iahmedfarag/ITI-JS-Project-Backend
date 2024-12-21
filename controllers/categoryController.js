import Category from "../Models/Category.js";
import Product from "../Models/Product.js";
import cloudinary from "../services/cloudinary.js";

/**
 * Create a new category
 */
export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if category already exists
        const existingCat = await Category.findOne({ name });
        if (existingCat) {
            return res.status(400).json({ error: "Category already exists" });
        }

        const newCategory = await Category.create({ name });
        res.status(201).json({ message: "Category created", category: newCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get all categories
 */
export const getAllCategories = async (req, res) => {
    try {
        // Populate the products if needed
        const categories = await Category.find().populate("products");
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate("products");
        if (!category) return res.status(404).json({ error: "Category not found" });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update a category
 */
export const updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json({ message: "Category updated", category: updatedCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a category
 */
export const deleteCategory = async (req, res) => {
    try {
        // 1. Check if category exists
        const catToDelete = await Category.findById(req.params.id);
        if (!catToDelete) {
            return res.status(404).json({ error: "Category not found" });
        }

        // 2. Find all products associated with this category
        const products = await Product.find({ category: catToDelete._id });

        // 3. Delete all resources (images) for each product in the category
        for (const product of products) {
            const folderPath = `ITI-JS-Project/${catToDelete._id}/${product._id}`;
            // Delete all files in the product folder
            await cloudinary.api.delete_resources_by_prefix(folderPath);
            // Optionally delete the empty folder
            await cloudinary.api.delete_folder(folderPath);
        }

        // 4. Delete the category folder from Cloudinary
        const categoryFolderPath = `ITI-JS-Project/${catToDelete._id}`;
        await cloudinary.api.delete_resources_by_prefix(categoryFolderPath); // Delete all resources under the category
        await cloudinary.api.delete_folder(categoryFolderPath); // Delete the category folder itself

        // 5. Delete all products associated with the category from the database
        await Product.deleteMany({ category: catToDelete._id });

        // 6. Delete the category itself
        await Category.findByIdAndDelete(req.params.id);

        // Respond with success
        res.json({
            message: "Category and all related products deleted successfully",
            category: catToDelete,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
