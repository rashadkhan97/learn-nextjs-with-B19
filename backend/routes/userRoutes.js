// ─────────────────────────────────────────────────────────────
// userRoutes.js — URL endpoints for user management
//
// Mounted at /api/users in app.js. Full URLs:
//   PUT    /api/users/profile/photo  ← logged-in user updates own photo
//   GET    /api/users                ← admin: list all users
//   GET    /api/users/:id            ← admin: view one user
//   PUT    /api/users/:id            ← admin: edit one user
//   DELETE /api/users/:id            ← admin: delete one user
//
// IMPORTANT — Route ORDER matters:
// "/profile/photo" is defined BEFORE "/:id".
// Express matches routes top-to-bottom. If /:id was first,
// it would match "profile" as the id and the photo route would never run.
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { uploadSingleImage } = require('../middlewares/uploadMiddleware');

// PUT /api/users/profile/photo — logged-in user (any role)
// upload.single('photo') processes the file and puts it in req.file
router.put('/profile/photo', authMiddleware, upload.single('photo'), userController.updateProfilePhoto);

// PUT /api/users/profile — logged-in user (any role) edits their OWN details.
// No :id here on purpose: the target comes from the JWT, so a user cannot
// point this at somebody else's account.
//
// MUST stay above '/:id' — Express matches top-to-bottom, and '/:id'
// would happily treat "profile" as an id.
router.put('/profile', authMiddleware, userController.updateProfile);

// PUT /api/users/:id/photo — admin only, sets ANOTHER user's photo.
// Capped at 2 MB. Declared after '/profile/photo' so that literal path
// still wins; two-segment paths never collide with '/:id' anyway.
router.put(
  '/:id/photo',
  authMiddleware,
  adminMiddleware,
  uploadSingleImage('photo', 2),
  userController.updateUserPhoto
);

// GET /api/users — admin only
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);

// GET /api/users/:id — admin only
router.get('/:id', authMiddleware, adminMiddleware, userController.getUserById);

// PUT /api/users/:id — admin only
router.put('/:id', authMiddleware, adminMiddleware, userController.updateUser);

// DELETE /api/users/:id — admin only
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);

module.exports = router;
