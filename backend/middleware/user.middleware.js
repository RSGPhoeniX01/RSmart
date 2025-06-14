import jwt from "jsonwebtoken";

const validateUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // console.log("Authorization Header:", authHeader); // Debugging line
        if (!authHeader || (!authHeader.startsWith("Bearer ") && !authHeader.startsWith("Bearer: "))) {
            return res.status(401).json({ error: "Invalid token format. Expected 'Bearer <token>'." });
        }

        // Extract token safely from both formats
        const token = authHeader
            .replace("Bearer", "")
            .replace(":", "")
            .trim();

        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = decoded;
        req.userId = decoded.userId; // Add this for convenience

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(400).json({ error: "Invalid token." });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token has expired." });
        } else {
            console.error("Error validating token:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
};

export default validateUser;
