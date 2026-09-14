const express = require('express');
const router = express.Router();
const { getLogs, getLog, createLog, updateLog, deleteLog, addAttachment } = require('../controllers/logsController');
const { protect } = require('../middleware/auth');
const { canEdit, isLeadOrAdmin } = require('../middleware/role');
const upload = require('../middleware/upload');

// Public GET routes
router.get('/', getLogs);
router.get('/:id', getLog);

// Protected write routes
router.post('/', protect, canEdit, createLog);
router.put('/:id', protect, canEdit, updateLog);
router.delete('/:id', protect, isLeadOrAdmin, deleteLog);
router.post('/:id/attachments', protect, canEdit, upload.single('file'), addAttachment);

module.exports = router;

