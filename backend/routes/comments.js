const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');
const { canEdit } = require('../middleware/role');

// Get comments for a document (public)
router.get('/:model/:id', asyncHandler(async (req, res) => {
  const { model, id } = req.params;
  const comments = await Comment.find({ onModel: model, onDocument: id, parentComment: null })
    .sort({ createdAt: -1 })
    .populate('author', 'name avatar role')
    .populate({
      path: 'parentComment',
      populate: { path: 'author', select: 'name avatar' },
    });

  // Fetch replies for each comment
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replies = await Comment.find({ parentComment: comment._id })
        .sort({ createdAt: 1 })
        .populate('author', 'name avatar role');
      return { ...comment.toObject(), replies };
    })
  );

  res.json({ success: true, comments: commentsWithReplies });
}));

// Create comment (Only Admin, Lead Archaeologist, Field Assistant)
router.post('/', protect, canEdit, asyncHandler(async (req, res) => {
  const comment = await Comment.create({ ...req.body, author: req.user._id });
  await comment.populate('author', 'name avatar role');
  res.status(201).json({ success: true, comment });
}));

// Update comment
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    res.status(403); throw new Error('Not authorized');
  }
  comment.content = req.body.content;
  comment.isEdited = true;
  await comment.save();
  await comment.populate('author', 'name avatar role');
  res.json({ success: true, comment });
}));

// Delete comment
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
    res.status(403); throw new Error('Not authorized');
  }
  await comment.deleteOne();
  res.json({ success: true, message: 'Comment removed' });
}));

// Like/unlike comment
router.put('/:id/like', protect, asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }
  const idx = comment.likes.indexOf(req.user._id);
  if (idx === -1) comment.likes.push(req.user._id);
  else comment.likes.splice(idx, 1);
  await comment.save();
  res.json({ success: true, likes: comment.likes.length });
}));

module.exports = router;
