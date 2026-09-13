// ─────────────────────────────────────────────────────────────
// gmailTest.js — Manual smoke test for gmailService
// Sends a real test email to your own GMAIL address so you can
// confirm the credentials in backend/.env actually work.
//
// Run with: npm run test:gmail
// ─────────────────────────────────────────────────────────────

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sendMail } = require('../services/gmailService');
const logger = require('../utils/logger');

const run = async () => {
  const to = process.env.GMAIL;

  const { messageId } = await sendMail({
    to,
    subject: 'Test Gmail Service',
    text: `This is a test email sent at ${new Date().toISOString()}`,
  });

  logger.info(`Test email sent to ${to} (messageId: ${messageId})`);
};

run().catch((err) => {
  logger.error(`Failed to send test email: ${err.message}`);
  process.exit(1);
});
