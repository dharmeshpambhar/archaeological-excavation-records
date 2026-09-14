const asyncHandler = require('express-async-handler');
const ExcavationLog = require('../models/ExcavationLog');
const Notification = require('../models/Notification');
const ExcavationSite = require('../models/ExcavationSite');

// @desc    Get logs for a site
// @route   GET /api/logs?site=:siteId
// @access  Private
const getLogs = asyncHandler(async (req, res) => {
  const { site, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (site) filter.site = site;

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ExcavationLog.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('site', 'name siteCode location')
      .populate('createdBy', 'name avatar role')
      .populate('teamPresent.user', 'name avatar'),
    ExcavationLog.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: logs.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    logs,
  });
});

// @desc    Get single log
// @route   GET /api/logs/:id
// @access  Private
const getLog = asyncHandler(async (req, res) => {
  const log = await ExcavationLog.findById(req.params.id)
    .populate('site', 'name siteCode')
    .populate('createdBy', 'name avatar role')
    .populate('teamPresent.user', 'name avatar');

  if (!log) {
    res.status(404);
    throw new Error('Log entry not found');
  }

  res.json({ success: true, log });
});

// @desc    Create log
// @route   POST /api/logs
// @access  Private
const createLog = asyncHandler(async (req, res) => {
  const logData = { ...req.body, createdBy: req.user._id };
  const log = await ExcavationLog.create(logData);
  await log.populate('createdBy', 'name avatar');
  await log.populate('site', 'name');

  // Notify site team
  const site = await ExcavationSite.findById(logData.site).populate('teamMembers.user');
  if (site) {
    const recipients = site.teamMembers
      .map((m) => m.user?._id)
      .filter((id) => id && id.toString() !== req.user._id.toString());

    const notifications = recipients.map((userId) => ({
      recipient: userId,
      actor: req.user._id,
      type: 'log_added',
      message: `${req.user.name} added a new field log to "${site.name}"`,
      link: `/logs/${log._id}`,
    }));
    if (notifications.length) await Notification.insertMany(notifications);
  }

  res.status(201).json({ success: true, log });
});

// @desc    Update log
// @route   PUT /api/logs/:id
// @access  Private
const updateLog = asyncHandler(async (req, res) => {
  let log = await ExcavationLog.findById(req.params.id);
  if (!log) {
    res.status(404);
    throw new Error('Log not found');
  }

  const isAuthorized =
    log.createdBy.toString() === req.user._id.toString() ||
    ['Admin', 'Lead Archaeologist'].includes(req.user.role);

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to update this log');
  }

  log = await ExcavationLog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('site', 'name siteCode')
    .populate('createdBy', 'name avatar');

  res.json({ success: true, log });
});

// @desc    Delete log
// @route   DELETE /api/logs/:id
// @access  Private
const deleteLog = asyncHandler(async (req, res) => {
  const log = await ExcavationLog.findById(req.params.id);
  if (!log) {
    res.status(404);
    throw new Error('Log not found');
  }

  if (
    log.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'Admin'
  ) {
    res.status(403);
    throw new Error('Not authorized');
  }

  await log.deleteOne();
  res.json({ success: true, message: 'Log entry removed' });
});

// @desc    Add attachment to log
// @route   POST /api/logs/:id/attachments
// @access  Private
const addAttachment = asyncHandler(async (req, res) => {
  const log = await ExcavationLog.findById(req.params.id);
  if (!log) {
    res.status(404);
    throw new Error('Log not found');
  }

  let fileUrl = req.body.url;
  let fileType = req.body.fileType || 'image';
  let filename = req.body.filename || '';

  if (req.file) {
    fileUrl = `/uploads/images/${req.file.filename}`;
    filename = req.file.originalname;
    fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'document';
  }

  log.attachments.push({ url: fileUrl, filename, fileType, caption: req.body.caption || '' });
  await log.save();
  res.json({ success: true, log });
});

module.exports = { getLogs, getLog, createLog, updateLog, deleteLog, addAttachment };
