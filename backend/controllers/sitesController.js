const asyncHandler = require('express-async-handler');
const ExcavationSite = require('../models/ExcavationSite');
const Artifact = require('../models/Artifact');
const Notification = require('../models/Notification');

// Helper: create notification for team members
const notifyTeam = async (site, actor, type, message, link) => {
  try {
    const actorId = actor?._id ? actor._id.toString() : (actor ? actor.toString() : '');
    const recipientIds = new Set();

    if (Array.isArray(site.teamMembers)) {
      site.teamMembers.forEach((m) => {
        const uId = m?.user?._id || m?.user;
        if (uId) {
          const str = uId.toString();
          if (str && str !== '[object Object]' && str !== actorId) {
            recipientIds.add(str);
          }
        }
      });
    }

    const creatorId = site.createdBy?._id || site.createdBy;
    if (creatorId) {
      const str = creatorId.toString();
      if (str && str !== '[object Object]' && str !== actorId) {
        recipientIds.add(str);
      }
    }

    const notifications = Array.from(recipientIds).map((userId) => ({
      recipient: userId,
      actor: actorId,
      type,
      message,
      link,
    }));

    if (notifications.length) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error('Failed to notify team:', err.message);
  }
};

// @desc    Get all sites
// @route   GET /api/sites
// @access  Private
const getSites = asyncHandler(async (req, res) => {
  const {
    status,
    era,
    search,
    page = 1,
    limit = 12,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const filter = { isArchived: false };
  if (status) filter.status = status;
  if (era) filter.era = era;
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [sites, total] = await Promise.all([
    ExcavationSite.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name avatar')
      .populate('teamMembers.user', 'name avatar role')
      .populate('artifactCount')
      .populate('logCount'),
    ExcavationSite.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: sites.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    sites,
  });
});

// @desc    Get all sites for map (minimal data)
// @route   GET /api/sites/map
// @access  Private
const getSitesForMap = asyncHandler(async (req, res) => {
  const sites = await ExcavationSite.find({ isArchived: false })
    .select('name siteCode status era location.coordinates location.country coverImage')
    .populate('artifactCount');

  res.json({ success: true, sites });
});

// @desc    Get single site
// @route   GET /api/sites/:id
// @access  Private
const getSite = asyncHandler(async (req, res) => {
  const site = await ExcavationSite.findById(req.params.id)
    .populate('createdBy', 'name avatar role')
    .populate('teamMembers.user', 'name avatar role expertise')
    .populate('photos.uploadedBy', 'name')
    .populate('artifactCount')
    .populate('logCount');

  if (!site) {
    res.status(404);
    throw new Error('Excavation site not found');
  }

  res.json({ success: true, site });
});

// @desc    Create site
// @route   POST /api/sites
// @access  Private (Lead Archaeologist, Admin)
const createSite = asyncHandler(async (req, res) => {
  const siteData = { ...req.body, createdBy: req.user._id };

  // Auto-add creator to team
  siteData.teamMembers = [
    { user: req.user._id, role: req.user.role, joinedAt: new Date() },
  ];

  const site = await ExcavationSite.create(siteData);
  await site.populate('createdBy', 'name avatar');

  res.status(201).json({ success: true, site });
});

// @desc    Update site
// @route   PUT /api/sites/:id
// @access  Private
const updateSite = asyncHandler(async (req, res) => {
  let site = await ExcavationSite.findById(req.params.id);
  if (!site) {
    res.status(404);
    throw new Error('Excavation site not found');
  }

  // Only creator, admin, or lead archaeologist can update
  const isAuthorized =
    site.createdBy.toString() === req.user._id.toString() ||
    ['Admin', 'Lead Archaeologist'].includes(req.user.role);

  if (!isAuthorized) {
    res.status(403);
    throw new Error('Not authorized to update this site');
  }

  const previousStatus = site.status;

  const updateData = { ...req.body };
  if (updateData.startDate === '') delete updateData.startDate;
  if (updateData.endDate === '') delete updateData.endDate;
  if (updateData.location && typeof updateData.location === 'object') {
    updateData.location = { ...updateData.location };
    if (updateData.location.coordinates) {
      const coords = { ...updateData.location.coordinates };
      const latVal = coords.lat;
      const lngVal = coords.lng;
      if (latVal === '' || latVal === null || latVal === undefined || isNaN(Number(latVal))) {
        delete coords.lat;
      } else {
        coords.lat = Number(latVal);
      }
      if (lngVal === '' || lngVal === null || lngVal === undefined || isNaN(Number(lngVal))) {
        delete coords.lng;
      } else {
        coords.lng = Number(lngVal);
      }
      updateData.location.coordinates = coords;
    }
  }

  site = await ExcavationSite.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('createdBy', 'name avatar')
    .populate('teamMembers.user', 'name avatar role');

  // Notify if status changed
  if (req.body.status && req.body.status !== previousStatus) {
    await notifyTeam(
      site,
      req.user,
      'status_changed',
      `${req.user.name} updated status of "${site.name}" to ${req.body.status}`,
      `/sites/${site._id}`
    );
  }

  res.json({ success: true, site });
});

// @desc    Delete site
// @route   DELETE /api/sites/:id
// @access  Private (Admin only)
const deleteSite = asyncHandler(async (req, res) => {
  const site = await ExcavationSite.findById(req.params.id);
  if (!site) {
    res.status(404);
    throw new Error('Excavation site not found');
  }

  if (req.user.role !== 'Admin' && site.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this site');
  }

  await site.deleteOne();
  res.json({ success: true, message: 'Excavation site removed' });
});

// @desc    Add photo to site
// @route   POST /api/sites/:id/photos
// @access  Private
const addSitePhoto = asyncHandler(async (req, res) => {
  const site = await ExcavationSite.findById(req.params.id);
  if (!site) {
    res.status(404);
    throw new Error('Site not found');
  }

  let photoUrl = req.body.url;
  if (req.file) {
    photoUrl = `/uploads/images/${req.file.filename}`;
  }

  site.photos.push({
    url: photoUrl,
    caption: req.body.caption || '',
    uploadedBy: req.user._id,
  });

  if (!site.coverImage && photoUrl) {
    site.coverImage = photoUrl;
  }

  await site.save();
  res.json({ success: true, site });
});

// @desc    Add team member to site
// @route   POST /api/sites/:id/team
// @access  Private (Lead/Admin)
const addTeamMember = asyncHandler(async (req, res) => {
  const site = await ExcavationSite.findById(req.params.id);
  if (!site) {
    res.status(404);
    throw new Error('Site not found');
  }

  const { userId, role } = req.body;
  const alreadyInTeam = site.teamMembers.some(
    (m) => m.user && m.user.toString() === userId
  );

  if (!alreadyInTeam) {
    site.teamMembers.push({ user: userId, role: role || 'Field Assistant', joinedAt: new Date() });
    await site.save();

    await Notification.create({
      recipient: userId,
      actor: req.user._id,
      type: 'team_joined',
      message: `${req.user.name} added you to the excavation team for "${site.name}"`,
      link: `/sites/${site._id}`,
    });
  }

  await site.populate('teamMembers.user', 'name avatar role');
  res.json({ success: true, site });
});

// @desc    Remove team member from site
// @route   DELETE /api/sites/:id/team/:userId
// @access  Private (Lead/Admin)
const removeTeamMember = asyncHandler(async (req, res) => {
  const site = await ExcavationSite.findById(req.params.id);
  if (!site) {
    res.status(404);
    throw new Error('Site not found');
  }

  site.teamMembers = site.teamMembers.filter(
    (m) => m.user && m.user.toString() !== req.params.userId
  );
  await site.save();
  await site.populate('teamMembers.user', 'name avatar role');

  res.json({ success: true, site });
});

module.exports = {
  getSites,
  getSitesForMap,
  getSite,
  createSite,
  updateSite,
  deleteSite,
  addSitePhoto,
  addTeamMember,
  removeTeamMember,
};
