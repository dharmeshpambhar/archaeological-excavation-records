const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const path = require('path');
const { protect } = require('../middleware/auth');
const { canEdit } = require('../middleware/role');
const upload = require('../middleware/upload');

router.use(protect);

// Upload single image (Only Admin, Lead Archaeologist, Field Assistant)
router.post('/image', canEdit, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  const url = `/uploads/images/${req.file.filename}`;
  res.json({ success: true, url, filename: req.file.filename });
}));

// Upload multiple images (Only Admin, Lead Archaeologist, Field Assistant)
router.post('/images', canEdit, upload.array('images', 10), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No files uploaded');
  }
  const urls = req.files.map((f) => ({
    url: `/uploads/images/${f.filename}`,
    filename: f.filename,
  }));
  res.json({ success: true, files: urls });
}));

// Upload avatar
router.post('/avatar', upload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  const url = `/uploads/avatars/${req.file.filename}`;
  res.json({ success: true, url });
}));

module.exports = router;
