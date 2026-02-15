/**
 * Authentication middleware – JWT verification and role-based authorization.
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.userId).select('-password -twoFactorSecret -twoFactorBackupCodes');
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }
    req.user = user; // full user document for controllers (e.g. createdBy)
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Authorize route - Check if user has required role(s)
 * @param {...string} roles - Roles allowed to access the route
 * TODO: Implement role-based authorization check
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};
