// ─────────────────────────────────────────────────────────────
// userController.js — HTTP layer for user CRUD operations
//
// These are admin-only endpoints (except updateProfilePhoto).
// authMiddleware + adminMiddleware are applied in the route file.
// ─────────────────────────────────────────────────────────────

const userService = require('../services/userService');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── GET ALL USERS ─────────────────────────────────────────────
// Handles: GET /api/users?page=1&limit=10&search=john

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await userService.getAllUsers({ page, limit, search });
    return success(res, result, 'Users fetched successfully');
  } catch (err) { next(err); }
};

// ── GET USER BY ID ────────────────────────────────────────────
// Handles: GET /api/users/:id

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return success(res, user, 'User fetched successfully');
  } catch (err) { next(err); }
};

// ── UPDATE USER ───────────────────────────────────────────────
// Handles: PUT /api/users/:id

const updateUser = async (req, res, next) => {
  try {
    const { firstname, lastname, email, phonenumber, role } = req.body;

    if (!firstname || !lastname || !email) {
      return error(res, 'firstname, lastname, and email are required', 400);
    }
    if (!EMAIL_REGEX.test(email)) {
      return error(res, 'Invalid email format', 400);
    }
    if (role && !['admin', 'user'].includes(role)) {
      return error(res, 'Role must be admin or user', 400);
    }

    const user = await userService.updateUser(req.params.id, { firstname, lastname, email, phonenumber, role });
    logger.info(`User updated by admin: id=${req.params.id}`);
    return success(res, user, 'User updated successfully');
  } catch (err) { next(err); }
};

// ── DELETE USER ───────────────────────────────────────────────
// Handles: DELETE /api/users/:id

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    logger.info(`User deleted by admin: id=${req.params.id}`);
    return success(res, null, 'User deleted successfully');
  } catch (err) { next(err); }
};

// ── UPDATE OWN PROFILE ────────────────────────────────────────
// Handles: PUT /api/users/profile
// Protected (requires login), but NOT admin-only — any role may edit
// their own details.
//
// SECURITY: the target is req.user.id, taken from the verified JWT.
// There is no :id in this route, so changing the URL cannot point it at
// another account. `role` is ignored even if sent in the body, so a
// normal user cannot promote themselves to admin.

const updateProfile = async (req, res, next) => {
  try {
    const { firstname, lastname, email, phonenumber } = req.body;

    if (!firstname || !lastname || !email) {
      return error(res, 'firstname, lastname, and email are required', 400);
    }
    if (!EMAIL_REGEX.test(email)) {
      return error(res, 'Invalid email format', 400);
    }

    const user = await userService.updateOwnProfile(req.user.id, {
      firstname,
      lastname,
      email,
      phonenumber,
    });

    logger.info(`Profile updated by user: id=${req.user.id}`);
    return success(res, user, 'Profile updated successfully');
  } catch (err) { next(err); }
};

// ── UPDATE PROFILE PHOTO ──────────────────────────────────────
// Handles: PUT /api/users/profile/photo
// Protected (requires login), but NOT admin-only

const updateProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'No file uploaded', 400);
    }

    // Construct the URL path for the frontend to display the image
    // Frontend prepends: http://localhost:5000/uploads/...
    const photoUrl = `/uploads/${req.file.filename}`;

    const user = await userService.updateProfilePhoto(req.user.id, photoUrl);
    logger.info(`Profile photo updated for user: id=${req.user.id}`);
    return success(res, user, 'Profile photo updated');
  } catch (err) { next(err); }
};

// ── UPDATE ANOTHER USER'S PHOTO (ADMIN) ───────────────────────
// Handles: PUT /api/users/:id/photo
// Admin only.
//
// Note the difference from updateProfilePhoto above: that one always
// targets req.user.id (the person making the request), so an admin
// could never set someone ELSE's photo with it. This one uses
// req.params.id, which is what the admin edit screen needs.

const updateUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'No file uploaded', 400);
    }

    const photoUrl = `/uploads/${req.file.filename}`;

    const user = await userService.updateProfilePhoto(req.params.id, photoUrl);
    logger.info(`Photo updated by admin for user: id=${req.params.id}`);
    return success(res, user, 'Photo updated');
  } catch (err) { next(err); }
};

module.exports = { getAllUsers, getUserById, updateUser, updateProfile, deleteUser, updateProfilePhoto, updateUserPhoto };
