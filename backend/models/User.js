// ─────────────────────────────────────────────────────────────
// User.js — Defines the structure of the "users" table in MySQL
// Sequelize reads this and automatically creates/updates the table
// ─────────────────────────────────────────────────────────────

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {

  // id — primary key, auto-increments (1, 2, 3, ...)
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // firstname — required text, max 100 characters
  firstname: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  // lastname — same rules as firstname
  lastname: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  // email — must be unique across all users
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },

  // phonenumber — optional
  phonenumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },

  // password — stores the HASHED password (never plain text!)
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  // photoUrl — stores the file path of the profile photo (e.g. "/uploads/abc.jpg")
  photoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },

  // role — can only be 'admin' or 'user'
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user',
  },

}, {
  tableName: 'users',       // the actual MySQL table name
  timestamps: true,         // auto-add createdAt and updatedAt columns
  createdAt: 'created_at',  // rename to snake_case
  updatedAt: 'updated_at',
});

module.exports = User;
