import User from "../Models/User.js";

/**
 * Create a new user (Register)
 * - Includes "role" with default "user" if not provided
 */
export const createUser = async (req, res) => {
    console.log(req);
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

        // Create new user
        const newUser = await User.create({
            email,
            firstName,
            lastName,
            password, // <-- Remember to hash in real-world scenarios
            role,
        });

        res.status(201).json({
            message: "User created successfully",
            user: newUser,
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
        const users = await User.find();
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

        // Optionally handle repeatPassword if needed
        // e.g. if (password !== repeatPassword)...

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { email, firstName, lastName, password, role },
            { new: true } // return the updated doc
        );
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
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User deleted successfully", user: deletedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
