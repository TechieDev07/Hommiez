import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware: Verify JWT Token
 * Ensures the request has a valid Bearer token and attaches user to req.user
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for "Bearer <token>" in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Please log in to perform this action.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_hommiez');

    // Fetch user without password
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired. Please log in again.',
    });
  }
};

/**
 * Middleware: Restrict access to specific roles
 * Example: authorize('broker') or authorize('student')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Only ${roles.join(' or ')} accounts can access this.`,
      });
    }
    next();
  };
};

/**
 * Middleware: Optional authentication
 * Attaches user to req.user if a valid token exists, but doesn't block if missing or invalid.
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_hommiez');
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Proceed as unauthenticated on error/expiration
  }
  next();
};
