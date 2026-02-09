/**
 * Authentication Middleware
 * 
 * Middleware pour l'authentification JWT et l'autorisation basée sur les rôles.
 * 
 * Phase 1: Utilise staticUser middleware pour les tests
 * Phase 2: À implémenter avec JWT tokens
 * 
 * @example
 * // Protection de route
 * router.get('/properties', auth.protect, propertyController.getAllProperties);
 * 
 * // Autorisation par rôle
 * router.delete('/properties/:id', auth.protect, auth.authorize('ADMIN'), propertyController.deleteProperty);
 */

/**
 * Protect route - Verify JWT token and attach user to request
 * TODO: Implement JWT token verification from Authorization header
 */
exports.protect = (req, res, next) => {
  // TODO: Phase 2 - Implement JWT token verification
  // 1. Extract token from Authorization header
  // 2. Verify token signature
  // 3. Find user in database
  // 4. Attach user to req.user
  // 5. Call next() or return 401 if invalid
  next();
};

/**
 * Authorize route - Check if user has required role(s)
 * @param {...string} roles - Roles allowed to access the route
 * TODO: Implement role-based authorization check
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // TODO: Phase 2 - Implement role-based authorization
    // 1. Check if req.user exists (from protect middleware)
    // 2. Check if req.user.role is in allowed roles array
    // 3. Call next() or return 403 if unauthorized
    next();
  };
};
