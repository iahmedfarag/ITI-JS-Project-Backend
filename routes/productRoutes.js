import { Router } from "express";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "../controllers/productController.js";
import upload from "../middlewares/multer.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.post(
    "/",
    auth, // Auth middleware
    upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "otherImages", maxCount: 4 },
    ]),
    createProduct
);

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.put(
    "/:id",
    auth, // Auth middleware
    upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "otherImages", maxCount: 4 },
    ]),
    updateProduct
);

router.delete("/:id", auth, deleteProduct);

export default router;
