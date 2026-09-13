// ─────────────────────────────────────────────────────────────
// userService.js — Business logic for user CRUD operations
//
// getAllUsers()         — list users with search + pagination
// getUserById()         — get one user by ID
// updateUser()          — admin updates a user's info
// deleteUser()          — admin deletes a user
// updateProfilePhoto()  — logged-in user updates own photo
// ─────────────────────────────────────────────────────────────

const { Op } = require('sequelize'); // Sequelize operators (LIKE, OR, NOT EQUAL, etc.)
const User = require('../models/User');

// ── GET ALL USERS ─────────────────────────────────────────────

const getAllUsers = async ({ page = 1, limit = 10, search = '' }) => {
  // Pagination: offset = (pageNumber - 1) * limit
  // Page 1 → offset 0, Page 2 → offset 10, etc.
  const offset = (Number(page) - 1) * Number(limit);

  // Build search filter if a search term was provided
  const whereClause = search
    ? {
        [Op.or]: [
          { firstname: { [Op.like]: `%${search}%` } },
          { lastname:  { [Op.like]: `%${search}%` } },
          { email:     { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  // findAndCountAll returns both results AND total count in one query
  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ['password'] }, // never send passwords to frontend
    order: [['created_at', 'DESC']],        // newest first
    limit: Number(limit),
    offset: Number(offset),
  });

  return {
    users,
    total: count,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(count / Number(limit)),
  };
};

// ── GET USER BY ID ────────────────────────────────────────────

const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

// ── UPDATE USER ───────────────────────────────────────────────

const updateUser = async (id, { firstname, lastname, email, phonenumber, role }) => {
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Check no OTHER user already has this email
  // Op.ne = "not equal" — excludes the current user from the check
  const emailExists = await User.findOne({
    where: {
      email,
      id: { [Op.ne]: id },
    },
  });

  if (emailExists) {
    const err = new Error('Email already in use by another account');
    err.statusCode = 409;
    throw err;
  }

  await user.update({ firstname, lastname, email, phonenumber: phonenumber || null, role });

  const updated = user.toJSON();
  delete updated.password;
  return updated;
};

// ── UPDATE OWN PROFILE ────────────────────────────────────────
// For a logged-in user editing THEMSELVES (any role).
//
// SECURITY: userId always comes from the JWT (req.user.id), never from
// the URL or the request body — so there is no id a caller could swap
// to edit somebody else.
//
// `role` is deliberately absent: if a normal user could set their own
// role they could promote themselves to admin.

const updateOwnProfile = async (userId, { firstname, lastname, email, phonenumber }) => {
  const user = await User.findByPk(userId);

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Check no OTHER user already has this email
  const emailExists = await User.findOne({
    where: {
      email,
      id: { [Op.ne]: userId },
    },
  });

  if (emailExists) {
    const err = new Error('Email already in use by another account');
    err.statusCode = 409;
    throw err;
  }

  await user.update({ firstname, lastname, email, phonenumber: phonenumber || null });

  const updated = user.toJSON();
  delete updated.password;
  return updated;
};

// ── DELETE USER ───────────────────────────────────────────────

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  await user.destroy();
};

// ── UPDATE PROFILE PHOTO ──────────────────────────────────────

const updateProfilePhoto = async (userId, photoUrl) => {
  const user = await User.findByPk(userId);

  // An admin can pass any id here, so the user may not exist.
  // Without this guard user.update() would throw a TypeError → 500.
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  await user.update({ photoUrl });

  const updated = user.toJSON();
  delete updated.password;
  return updated;
};

module.exports = { getAllUsers, getUserById, updateUser, updateOwnProfile, deleteUser, updateProfilePhoto };
