import User from "../Models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * Create a new user (Register)
 * - Includes "role" with default "user" if not provided
 */

export const createUser = async (req, res) => {
    try {
        const { email, firstName, lastName, password, repeatPassword, role = "user" } = req.body;

        // Basic check for matching passwords
        if (password !== repeatPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        // Check if the email is already in use
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }

        // Create new user (let the pre-save hook handle hashing)
        const newUser = await User.create({
            email,
            firstName,
            lastName,
            password, // Plain text password
            role,
        });

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get all users
 */
export const getAllUsers = async (req, res) => {
    try {
        // Check if the user has the admin role
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const users = await User.find(); // Get all users
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get a single user by ID
 */
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update a user
 * - Allows updating role if needed
 */
export const updateUser = async (req, res) => {
    try {
        const { email, firstName, lastName, password, role } = req.body;

        // Allow admin to update any user, regular users can only update themselves
        if (req.user.role !== "admin" && req.user.userId !== req.params.id) {
            return res.status(403).json({ error: "Access denied. You can only update your own account." });
        }

        const updateData = { email, firstName, lastName };

        // If password is being updated, hash it
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        // Allow admins to update role
        if (req.user.role === "admin" && role) {
            updateData.role = role;
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!updatedUser) return res.status(404).json({ error: "User not found" });

        res.json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a user
 */
export const deleteUser = async (req, res) => {
    try {
        // Allow admin to delete any user, regular users can only delete themselves
        if (req.user.role !== "admin" && req.user.userId !== req.params.id) {
            return res.status(403).json({ error: "Access denied. You can only delete your own account." });
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) return res.status(404).json({ error: "User not found" });

        res.json({ message: "User deleted successfully", user: deletedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Login
 */
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        console.log(user);

        if (!user) {
            return res.status(404).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
