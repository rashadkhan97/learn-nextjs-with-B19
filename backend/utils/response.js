// ─────────────────────────────────────────────────────────────
// response.js — Standardized API response format
//
// Every API endpoint sends JSON in the same shape:
// { success: true/false, message: "...", data: {...} }
// ─────────────────────────────────────────────────────────────

// success() — use when everything works fine
const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// error() — use when something goes wrong
const error = (res, message = 'Internal Server Error', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { success, error };
