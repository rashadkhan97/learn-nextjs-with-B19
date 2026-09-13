// ─────────────────────────────────────────────────────────────
// adminMiddleware.js — Checks that the logged-in user is an admin
//
// IMPORTANT: Must always be used AFTER authMiddleware.
// authMiddleware sets req.user. This middleware reads req.user.role.
//
// Usage in routes:
// router.get('/users', authMiddleware, adminMiddleware, controller)
// ─────────────────────────────────────────────────────────────

const { error } = require('../utils/response');

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return error(res, 'Access denied. Admins only.', 403);
  }
  next();
};

module.exports = adminMiddleware;
