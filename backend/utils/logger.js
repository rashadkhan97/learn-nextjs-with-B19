// ─────────────────────────────────────────────────────────────
// logger.js — A simple logging helper
// Adds a timestamp and level to every log message.
//
// Example output:
// [2024-01-15T10:30:00.000Z] [INFO] Server running on port 5000
// ─────────────────────────────────────────────────────────────

const log = (level, message) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${level.toUpperCase()}] ${message}`);
};

module.exports = {
  info:  (msg) => log('info', msg),
  error: (msg) => log('error', msg),
  warn:  (msg) => log('warn', msg),
};
