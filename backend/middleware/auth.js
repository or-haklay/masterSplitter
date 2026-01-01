// middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify JWT tokens
 * Adds userId to req object if token is valid
 */
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ error: 'Token required' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { authenticateToken };

