// ─────────────────────────────────────────────────────────────
// uploadMiddleware.js — Handles profile photo file uploads
//
// multer processes multipart/form-data requests (file uploads),
// saves the file to disk, and puts file info into req.file.
// ─────────────────────────────────────────────────────────────

const multer = require('multer');
const path = require('path');

// Configure where and how to save files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // saves inside backend/uploads/
  },
  filename: (req, file, cb) => {
    // Unique name: timestamp + random number + original extension
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
    // e.g. "1705312400000-123456789.jpg"
  },
});

// Only allow image file types
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, gif, webp) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// ── SIZE-LIMITED SINGLE IMAGE UPLOAD ──────────────────────────
// Same storage and fileFilter as above, but with a caller-chosen size cap.
//
// Why wrap it? multer reports "file too big" and "wrong file type" by
// calling next(err) with an error that has NO statusCode, so
// errorMiddleware would report a user mistake as a 500. This wrapper
// tags them as 400 and gives the size error a readable message.
const uploadSingleImage = (fieldName, maxSizeMb) => {
  const uploader = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
  }).single(fieldName);

  return (req, res, next) =>
    uploader(req, res, (err) => {
      if (!err) return next();

      err.statusCode = 400;
      if (err.code === 'LIMIT_FILE_SIZE') {
        err.message = `Photo must be ${maxSizeMb} MB or smaller`;
      }
      next(err);
    });
};

// Use upload.single('photo') in routes — expects one file with field name "photo"
module.exports = upload;
module.exports.uploadSingleImage = uploadSingleImage;
