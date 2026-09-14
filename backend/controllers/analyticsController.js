const asyncHandler = require('express-async-handler');
const ExcavationSite = require('../models/ExcavationSite');
const Artifact = require('../models/Artifact');
const ExcavationLog = require('../models/ExcavationLog');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const [
    totalSites,
    totalArtifacts,
    totalLogs,
    totalUsers,
    sitesByStatus,
    sitesByEra,
    artifactsByCategory,
    artifactsByEra,
    recentActivity,
    artifactsThisMonth,
    sitesThisMonth,
  ] = await Promise.all([
    ExcavationSite.countDocuments({ isArchived: false }),
    Artifact.countDocuments(),
    ExcavationLog.countDocuments(),
    User.countDocuments({ isActive: true }),

    // Sites grouped by status
    ExcavationSite.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Sites grouped by era
    ExcavationSite.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$era', count: { $sum: 1 } } },
    ]),

    // Artifacts by category
    Artifact.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),

    // Artifacts by era
    Artifact.aggregate([{ $group: { _id: '$era', count: { $sum: 1 } } }]),

    // Recent notifications for activity feed
    req.user
      ? Notification.find({ recipient: req.user._id })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('actor', 'name avatar')
      : Notification.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('actor', 'name avatar'),

    // Artifacts added this month
    Artifact.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    }),

    // Sites created this month
    ExcavationSite.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    }),
  ]);

  // Monthly artifacts trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyArtifacts = await Artifact.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    stats: {
      totalSites,
      totalArtifacts,
      totalLogs,
      totalUsers,
      artifactsThisMonth,
      sitesThisMonth,
    },
    charts: {
      sitesByStatus,
      sitesByEra,
      artifactsByCategory,
      artifactsByEra,
      monthlyArtifacts,
    },
    recentActivity,
  });
});

// @desc    Get site-specific analytics
// @route   GET /api/analytics/site/:id
// @access  Private
const getSiteAnalytics = asyncHandler(async (req, res) => {
  const siteId = req.params.id;

  const [artifactsByCategory, artifactsByCondition, logsByMonth, totalArtifacts, totalLogs] =
    await Promise.all([
      Artifact.aggregate([
        { $match: { site: require('mongoose').Types.ObjectId(siteId) } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Artifact.aggregate([
        { $match: { site: require('mongoose').Types.ObjectId(siteId) } },
        { $group: { _id: '$condition', count: { $sum: 1 } } },
      ]),
      ExcavationLog.aggregate([
        { $match: { site: require('mongoose').Types.ObjectId(siteId) } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Artifact.countDocuments({ site: siteId }),
      ExcavationLog.countDocuments({ site: siteId }),
    ]);

  res.json({
    success: true,
    stats: { totalArtifacts, totalLogs },
    charts: { artifactsByCategory, artifactsByCondition, logsByMonth },
  });
});

module.exports = { getDashboardAnalytics, getSiteAnalytics };
