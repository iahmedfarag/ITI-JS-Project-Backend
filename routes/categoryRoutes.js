import { Router } from "express";
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { auth } from "../middlewares/auth.js";
const router = Router();

router.post("/", auth, createCategory); // Admin only
router.get("/", getAllCategories); // Public
router.get("/:id", getCategoryById); // Public
router.put("/:id", auth, updateCategory); // Admin only
router.delete("/:id", auth, deleteCategory); // Admin only

export default router;
