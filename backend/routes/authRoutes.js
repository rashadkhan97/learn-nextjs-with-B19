// ─────────────────────────────────────────────────────────────
// authRoutes.js — URL endpoints for authentication
//
// Mounted at /api/auth in app.js. Full URLs:
//   POST  /api/auth/register
//   POST  /api/auth/login
//   GET   /api/auth/me
//   PATCH /api/auth/change-password
//   POST  /api/auth/forgot-password
//   POST  /api/auth/reset-password
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST /api/auth/register — no auth needed, anyone can register
router.post('/register', authController.register);

// POST /api/auth/login — no auth needed
router.post('/login', authController.login);

// GET /api/auth/me — must be logged in (authMiddleware checks the JWT)
router.get('/me', authMiddleware, authController.getMe);

// PATCH /api/auth/change-password — must be logged in
router.patch('/change-password', authMiddleware, authController.changePassword);

// POST /api/auth/forgot-password — no auth needed, that's the point
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password — no auth needed, the token IS the credential
router.post('/reset-password', authController.resetPassword);

module.exports = router;
