import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from the Authorization header

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
};
