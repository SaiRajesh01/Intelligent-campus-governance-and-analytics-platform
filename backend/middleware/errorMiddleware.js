// errorMiddleware.js - Centralized error handling

// 404 handler — catches requests that don't match any route
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Generic error handler — must be the last middleware registered
const errorHandler = (err, req, res, next) => {
  // If the response status is still 200 (default), override to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};

module.exports = { notFound, errorHandler };
