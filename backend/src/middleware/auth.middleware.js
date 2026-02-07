/**
 * Auth middleware (Phase 2 - JWT authentication)
 * Placeholder for future implementation
 */

exports.protect = (req, res, next) => {
  // TODO: Implement JWT token verification
  // For Phase 1, we can skip authentication
  next();
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    // TODO: Implement role-based authorization
    // Check if user role is in allowed roles
    next();
  };
};
