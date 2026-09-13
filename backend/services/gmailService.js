// ─────────────────────────────────────────────────────────────
// gmailService.js — Send emails through Gmail (SMTP + app password)
//
// sendMail() — send an email via the configured Gmail account
// ─────────────────────────────────────────────────────────────

const nodemailer = require('nodemailer');

let transporter = null;

// Built lazily so a missing GMAIL/GMAIL_APP_PASSWORD only fails
// when someone actually tries to send mail, not at require-time.
const getTransporter = () => {
  if (transporter) return transporter;

  const { GMAIL, GMAIL_APP_PASSWORD } = process.env;

  if (!GMAIL || !GMAIL_APP_PASSWORD) {
    const err = new Error('GMAIL and GMAIL_APP_PASSWORD must be set in backend/.env');
    err.statusCode = 500;
    throw err;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL,
      pass: GMAIL_APP_PASSWORD, // Gmail app password, not the account password
    },
  });

  return transporter;
};

// ── SEND MAIL ────────────────────────────────────────────────

const sendMail = async ({ to, subject, text, html }) => {
  if (!to || !subject || (!text && !html)) {
    const err = new Error('to, subject, and text or html are required');
    err.statusCode = 400;
    throw err;
  }

  const info = await getTransporter().sendMail({
    from: process.env.GMAIL,
    to,
    subject,
    text,
    html,
  });

  return { messageId: info.messageId };
};

module.exports = { sendMail };
