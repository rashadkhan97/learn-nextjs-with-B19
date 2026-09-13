// ─────────────────────────────────────────────────────────────
// authService.js — Business logic for authentication
//
// register()        — create a new user account
// login()            — verify credentials and return a JWT token
// getMe()             — fetch the currently logged-in user's data
// changePassword()    — update password while logged in
// forgotPassword()    — email a reset link for a "forgot password" request
// resetPassword()     — consume a reset link to set a new password
// ─────────────────────────────────────────────────────────────

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendMail } = require('./gmailService');
const logger = require('../utils/logger');

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

// ── REGISTER ──────────────────────────────────────────────────

const register = async ({ firstname, lastname, email, phonenumber, password }) => {
  // Check if this email is already registered
  const existing = await User.findOne({ where: { email } });

  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409; // 409 Conflict
    throw err;
  }

  // Hash the password BEFORE saving — never store plain text passwords
  // Salt rounds = 10: good balance between security and speed
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the new user
  const user = await User.create({
    firstname,
    lastname,
    email,
    phonenumber: phonenumber || null,
    password: hashedPassword,
    role: 'user', // new registrations are always 'user', never 'admin'
  });

  // Best-effort — a failed confirmation email shouldn't fail registration,
  // the account is already created at this point.
  try {
    await sendMail({
      to: user.email,
      subject: 'Welcome! Your account is ready',
      html: `
        <p>Hi ${user.firstname},</p>
        <p>Your account has been created successfully with the email <strong>${user.email}</strong>.</p>
        <p>You can now log in and start using your account.</p>
      `,
    });
  } catch (err) {
    logger.error(`Failed to send registration confirmation email to ${user.email}: ${err.message}`);
  }

  // Return only safe fields (never return the password)
  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
  };
};

// ── LOGIN ─────────────────────────────────────────────────────

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    // Generic message — don't reveal whether the email exists or not
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  // bcrypt.compare() hashes the input and compares with stored hash
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  // Create a JWT token — stores { id, email, role } as payload
  // The frontend stores this token and sends it with every protected request
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  // Remove password from the response object
  const userObj = user.toJSON();
  delete userObj.password;
  return { token, user: userObj };
};

// ── GET ME ────────────────────────────────────────────────────

const getMe = async (userId) => {
  // findByPk = "find by Primary Key" (the id column)
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] }, // don't select the password column
  });

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

// ── CHANGE PASSWORD ──────────────────────────────────────────

const changePassword = async (userId, { currentPassword, newPassword }) => {
  // Need the password column here — unlike getMe(), which excludes it
  const user = await User.findByPk(userId);

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 401;
    throw err;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
};

// ── FORGOT PASSWORD ──────────────────────────────────────────

const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    const err = new Error('Sorry, your email is not registered. Try with your registered email');
    err.statusCode = 404;
    throw err;
  }

  // Invalidate any reset links still outstanding for this user
  await PasswordReset.destroy({ where: { userId: user.id } });

  const rawToken = crypto.randomBytes(32).toString('hex');

  await PasswordReset.create({
    userId: user.id,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

  await sendMail({
    to: user.email,
    subject: 'Reset your password',
    html: `
      <p>Hi ${user.firstname},</p>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
};

// ── RESET PASSWORD ───────────────────────────────────────────

const resetPassword = async (rawToken, newPassword) => {
  const record = await PasswordReset.findOne({
    where: { tokenHash: hashToken(rawToken), used: false },
  });

  if (!record || record.expiresAt < new Date()) {
    const err = new Error('Invalid or expired reset link');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByPk(record.userId);
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  record.used = true;
  await record.save();
};

module.exports = { register, login, getMe, changePassword, forgotPassword, resetPassword };
