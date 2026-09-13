// ─────────────────────────────────────────────────────────────
// server.js — Application entry point
//
// Start the backend:
//   npm run dev    (development — auto-restarts on file save)
//   npm start      (production)
//
// Startup sequence:
// 1. Load .env variables
// 2. Create DB_NAME if it does not exist
// 3. Sync Sequelize models with MySQL (creates/updates the users table)
// 4. Start HTTP server on PORT
// ─────────────────────────────────────────────────────────────

require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');
const logger = require('./utils/logger');
const { ensureDatabaseExists } = sequelize;

// Register every model before sync so Sequelize knows which tables to create.
require('./models/User');
require('./models/PasswordReset');

const PORT = process.env.PORT || 5000;

// sequelize.sync({ alter: true }):
//   - Creates the 'users' table if it doesn't exist
//   - Adds missing columns if the model has new fields
// WARNING: Never use { force: true } — it DROPS and recreates the table (deletes all data)
async function startServer() {
  try {
    await ensureDatabaseExists();
    logger.info(`Database "${process.env.DB_NAME}" is ready`);

    await sequelize.authenticate();
    logger.info('Database connection established');

    await sequelize.sync({ alter: true });
    logger.info('Database synced successfully');

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    logger.error(`Database sync failed: ${err.message}`);
    process.exit(1);
  }
}

startServer();
