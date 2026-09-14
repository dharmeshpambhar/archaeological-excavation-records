const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get bookmarks
router.get('/', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, bookmarks: user.bookmarks || [] });
}));

// Add bookmark
router.post('/', asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.body;
  const user = await User.findById(req.user._id);

  const exists = user.bookmarks.some(
    (b) => b.itemId.toString() === itemId && b.itemType === itemType
  );

  if (!exists) {
    user.bookmarks.push({ itemType, itemId, savedAt: new Date() });
    await user.save({ validateBeforeSave: false });
  }

  res.json({ success: true, bookmarks: user.bookmarks });
}));

// Remove bookmark
router.delete('/:itemId', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.bookmarks = user.bookmarks.filter(
    (b) => b.itemId.toString() !== req.params.itemId
  );
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, bookmarks: user.bookmarks });
}));

module.exports = router;
