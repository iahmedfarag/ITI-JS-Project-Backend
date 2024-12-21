import { Router } from "express";
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/userController.js";

const router = Router();

// Create (Register)
router.post("/", createUser);

// Read (Get all users)
router.get("/", getAllUsers);

// Read (Get one user)
router.get("/:id", getUserById);

// Update
router.put("/:id", updateUser);

// Delete
router.delete("/:id", deleteUser);

export default router;
