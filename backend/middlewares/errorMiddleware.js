// ─────────────────────────────────────────────────────────────
// errorMiddleware.js — Centralized error handler for Express
//
// Express recognizes an error-handling middleware by EXACTLY 4 parameters.
// Do not remove any parameter — Express won't treat it as an error handler.
//
// Controllers call next(err) to forward errors here.
// ─────────────────────────────────────────────────────────────

const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error(`${err.message} | ${req.method} ${req.originalUrl}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;
