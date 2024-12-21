import { Router } from "express";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "../controllers/productController.js";

import upload from "../middlewares/multer.js";

const router = Router();

// We need to handle both a single mainImage and multiple otherImages
router.post(
    "/",
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
    upload.fields([
        { name: "mainImage", maxCount: 1 },
        { name: "otherImages", maxCount: 4 },
    ]),
    updateProduct
);

router.delete("/:id", deleteProduct);

export default router;
