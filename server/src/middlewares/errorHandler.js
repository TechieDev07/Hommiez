/**
 * Centralized Error Handling Middleware
 * Returns consistent JSON response for all API errors
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`❌ Error [${req.method} ${req.url}]:`, message);

  res.status(statusCode).json({
    success: false,
    message,
    // Only include stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
