// ─────────────────────────────────────────────────────────────
// authController.js — HTTP layer for authentication
//
// Receives request → validates inputs → calls authService → sends response
// ─────────────────────────────────────────────────────────────

const authService = require('../services/authService');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GMAIL_REGEX = /^[^\s@]+@gmail\.com$/i;

// ── REGISTER ──────────────────────────────────────────────────
// Handles: POST /api/auth/register

const register = async (req, res, next) => {
  try {
    const { firstname, lastname, email, phonenumber, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return error(res, 'firstname, lastname, email, and password are required', 400);
    }
    if (!EMAIL_REGEX.test(email)) {
      return error(res, 'Invalid email format', 400);
    }
    if (!GMAIL_REGEX.test(email)) {
      return error(res, 'Only gmail.com email addresses are allowed', 400);
    }
    if (password.length < 4) {
      return error(res, 'Password must be at least 4 characters', 400);
    }

    const result = await authService.register({ firstname, lastname, email, phonenumber, password });
    logger.info(`New user registered: ${email}`);
    return success(res, result, 'User registered successfully', 201);

  } catch (err) {
    next(err);
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
// Handles: POST /api/auth/login

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    const result = await authService.login({ email, password });
    logger.info(`User logged in: ${email}`);
    return success(res, result, 'Login successful');

  } catch (err) {
    next(err);
  }
};

// ── GET ME ────────────────────────────────────────────────────
// Handles: GET /api/auth/me
// Protected — authMiddleware runs first and sets req.user

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, user, 'User profile fetched');
  } catch (err) {
    next(err);
  }
};

// ── CHANGE PASSWORD ───────────────────────────────────────────
// Handles: PATCH /api/auth/change-password
// Protected — authMiddleware runs first and sets req.user

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return error(res, 'currentPassword and newPassword are required', 400);
    }
    if (newPassword.length < 4) {
      return error(res, 'New password must be at least 4 characters', 400);
    }

    await authService.changePassword(req.user.id, { currentPassword, newPassword });
    logger.info(`Password changed for user id ${req.user.id}`);
    return success(res, null, 'Password changed successfully');

  } catch (err) {
    next(err);
  }
};

// ── FORGOT PASSWORD ──────────────────────────────────────────
// Handles: POST /api/auth/forgot-password

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return error(res, 'Email is required', 400);
    }

    await authService.forgotPassword(email);
    logger.info(`Password reset requested for ${email}`);

    return success(res, null, 'Please check your email for the password reset link');

  } catch (err) {
    next(err);
  }
};

// ── RESET PASSWORD ───────────────────────────────────────────
// Handles: POST /api/auth/reset-password

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return error(res, 'token and newPassword are required', 400);
    }
    if (newPassword.length < 4) {
      return error(res, 'New password must be at least 4 characters', 400);
    }

    await authService.resetPassword(token, newPassword);
    logger.info('Password reset via reset link');
    return success(res, null, 'Password reset successfully');

  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, changePassword, forgotPassword, resetPassword };
