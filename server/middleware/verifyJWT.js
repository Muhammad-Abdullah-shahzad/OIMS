const jwt = require("jsonwebtoken");


const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to protect routes
exports.authenticateToken=(req, res, next) => {
  
  const authHeader = req.headers['authorization'];
  // Token format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ message: "Invalid or expired token" ,tokenVerified:false});
    }

    req.user = user; // Attach decoded token data to request object

    next();
  });
}


