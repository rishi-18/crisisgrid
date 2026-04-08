const jwt = require('jsonwebtoken');

/**
 * Middleware to verify the JWT from the Authorization header
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // { userId, role, assignedCampId }
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

/**
 * Middleware to restrict access based on user roles
 * @param {...string} roles - Array of allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden. This action requires one of the following roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = { verifyToken, requireRole };
