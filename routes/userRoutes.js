import { Router } from "express";
import { createUser, getAllUsers, getUserById, updateUser, deleteUser, loginUser } from "../controllers/userController.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Create (Register)
router.post("/", createUser);

// Login
router.post("/login", loginUser);

// Read (Get all users - protected)
router.get("/", auth, getAllUsers);

// Read (Get one user - protected)
router.get("/:id", auth, getUserById);

// Update - protected
router.put("/:id", auth, updateUser);

// Delete - protected
router.delete("/:id", auth, deleteUser);

export default router;
