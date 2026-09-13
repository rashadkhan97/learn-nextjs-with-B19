// ─────────────────────────────────────────────────────────────
// app.js — Creates and configures the Express application
//
// Does NOT start the server (that's server.js).
// Sets up middleware, routes, 404 handler, and error handler.
// ─────────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const swaggerSpec = require('./config/swagger');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

// ── CORS ──────────────────────────────────────────────────────
// Browsers block requests between different origins (ports/domains).
// cors() tells the browser: allow requests from any origin.
app.use(cors());

// ── BODY PARSERS ──────────────────────────────────────────────
// Without these, req.body would be undefined
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── STATIC FILES ──────────────────────────────────────────────
// Serve uploaded images at /uploads/filename.jpg
// __dirname = backend, so this resolves to backend/uploads —
// the same folder multer writes to in uploadMiddleware.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API ROUTES ────────────────────────────────────────────────
app.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ── HEALTH CHECK ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 HANDLER ───────────────────────────────────────────────
// Must be AFTER all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── ERROR HANDLER ─────────────────────────────────────────────
// Must be LAST — catches errors forwarded by next(err)
app.use(errorMiddleware);

module.exports = app;
