// ─────────────────────────────────────────────────────────────
// authMiddleware.js — Verifies that the user is logged in
//
// HOW JWT WORKS:
// 1. User logs in → server creates a JWT token
// 2. Frontend stores this token in localStorage
// 3. For every protected request, frontend sends:
//    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
// 4. This middleware reads that header, verifies the token,
//    and attaches decoded user info to req.user
// ─────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // If there's no header OR it doesn't start with "Bearer ", reject
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'No token provided. Please login first.', 401);
  }

  // Split "Bearer <token>" and take the token part
  const token = authHeader.split(' ')[1];

  try {
    // jwt.verify() checks signature, expiry, and format
    // Returns the payload we stored when creating the token: { id, email, role }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach to request for controllers to use
    next();
  } catch (err) {
    return error(res, 'Invalid or expired token. Please login again.', 401);
  }
};

module.exports = authMiddleware;
