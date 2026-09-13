// ─────────────────────────────────────────────────────────────
// db.js — Creates and exports the Sequelize database connection
// Think of this as the "phone line" to MySQL.
// All other files import this to talk to the database.
// ─────────────────────────────────────────────────────────────

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const databaseName = process.env.DB_NAME;
const databaseUser = process.env.DB_USER;
const databasePassword = process.env.DB_PASSWORD;
const connectionOptions = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql',
  logging: false,
};

if (!databaseName || !databaseUser || !connectionOptions.host) {
  throw new Error('DB_NAME, DB_USER, and DB_HOST must be set in backend/.env');
}

// This connection is lazy, so DB_NAME does not need to exist yet.
const sequelize = new Sequelize(
  databaseName,
  databaseUser,
  databasePassword,
  connectionOptions
);

async function ensureDatabaseExists() {
  const bootstrapConnection = new Sequelize(
    '',
    databaseUser,
    databasePassword,
    connectionOptions
  );

  try {
    const queryGenerator = bootstrapConnection.getQueryInterface().queryGenerator;
    const quotedDatabaseName = queryGenerator.quoteIdentifier(databaseName);

    await bootstrapConnection.query(
      `CREATE DATABASE IF NOT EXISTS ${quotedDatabaseName}`
    );
  } finally {
    await bootstrapConnection.close();
  }
}

module.exports = sequelize;
module.exports.ensureDatabaseExists = ensureDatabaseExists;
