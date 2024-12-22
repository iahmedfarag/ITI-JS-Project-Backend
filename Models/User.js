import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Pre-save hook to hash passwords
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    console.log("Hashing Password:", this.password); // Log the raw password
    this.password = await bcrypt.hash(this.password, 10);
    console.log("Hashed Password:", this.password); // Log the hashed password
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
