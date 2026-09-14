const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const ExcavationSite = require('../models/ExcavationSite');
const Artifact = require('../models/Artifact');
const ExcavationLog = require('../models/ExcavationLog');
// Global search (public)
router.get('/', asyncHandler(async (req, res) => {
  const { q, type, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({ success: true, results: { sites: [], artifacts: [], logs: [] } });
  }

  const searchRegex = { $regex: q, $options: 'i' };

  const results = {};

  if (!type || type === 'sites') {
    results.sites = await ExcavationSite.find({
      $or: [{ name: searchRegex }, { description: searchRegex }, { 'location.country': searchRegex }],
      isArchived: false,
    })
      .select('name siteCode status era coverImage location.country')
      .limit(Number(limit));
  }

  if (!type || type === 'artifacts') {
    results.artifacts = await Artifact.find({
      $or: [{ name: searchRegex }, { description: searchRegex }, { material: searchRegex }],
    })
      .select('name catalogNumber category era images')
      .populate('site', 'name')
      .limit(Number(limit));
  }

  if (!type || type === 'logs') {
    results.logs = await ExcavationLog.find({
      $or: [{ title: searchRegex }, { findings: searchRegex }],
    })
      .select('title date site')
      .populate('site', 'name siteCode')
      .limit(Number(limit));
  }

  res.json({ success: true, query: q, results });
}));

module.exports = router;
