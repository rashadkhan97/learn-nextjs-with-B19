// ─────────────────────────────────────────────────────────────
// PasswordReset.js — Defines the "password_resets" table in MySQL
//
// One row per outstanding reset link. The raw token is only ever
// emailed to the user — we store its SHA-256 hash, so a leaked
// database never hands out a usable token (same idea as hashing
// passwords, just a cheap hash since the token is already
// high-entropy random data, not a guessable secret).
// ─────────────────────────────────────────────────────────────

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const PasswordReset = sequelize.define('PasswordReset', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },

  // SHA-256 hex digest of the raw token sent by email
  tokenHash: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    field: 'token_hash',
  },

  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
  },

  used: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },

}, {
  tableName: 'password_resets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

PasswordReset.belongsTo(User, { foreignKey: 'userId' });

module.exports = PasswordReset;
