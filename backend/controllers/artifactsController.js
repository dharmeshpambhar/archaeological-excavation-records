const asyncHandler = require("express-async-handler");
const Artifact = require("../models/Artifact");
const Notification = require("../models/Notification");
const ExcavationSite = require("../models/ExcavationSite");

// @desc    Get all artifacts
// @route   GET /api/artifacts
// @access  Private
const getArtifacts = asyncHandler(async (req, res) => {
  const {
    site,
    category,
    era,
    material,
    condition,
    preservationStatus,
    search,
    page = 1,
    limit = 12,
    sortBy = "createdAt",
    order = "desc",
    tags,
  } = req.query;

  const filter = {};
  if (site) filter.site = site;
  if (category) filter.category = category;
  if (era) filter.era = era;
  if (condition) filter.condition = condition;
  if (preservationStatus) filter.preservationStatus = preservationStatus;
  if (material) filter.material = { $regex: material, $options: "i" };
  if (tags) filter.tags = { $in: tags.split(",") };
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: order === "asc" ? 1 : -1 };

  const [artifacts, total] = await Promise.all([
    Artifact.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate("site", "name siteCode")
      .populate("discoveredBy", "name avatar")
      .populate("createdBy", "name avatar"),
    Artifact.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: artifacts.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    artifacts,
  });
});

// @desc    Get single artifact
// @route   GET /api/artifacts/:id
// @access  Private
const getArtifact = asyncHandler(async (req, res) => {
  const artifact = await Artifact.findById(req.params.id)
    .populate("site", "name siteCode location era")
    .populate("discoveredBy", "name avatar role")
    .populate("createdBy", "name avatar");

  if (!artifact) {
    res.status(404);
    throw new Error("Artifact not found");
  }

  res.json({ success: true, artifact });
});

// @desc    Create artifact
// @route   POST /api/artifacts
// @access  Private
const createArtifact = asyncHandler(async (req, res) => {
  const artifactData = {
    ...req.body,
    createdBy: req.user._id,
    discoveredBy: req.body.discoveredBy || req.user._id,
  };

  const artifact = await Artifact.create(artifactData);
  await artifact.populate("site", "name siteCode");
  await artifact.populate("createdBy", "name avatar");

  // Notify site team
  const site = await ExcavationSite.findById(artifactData.site).populate(
    "teamMembers.user",
  );
  if (site) {
    const recipients = site.teamMembers
      .map((m) => m.user?._id)
      .filter((id) => id && id.toString() !== req.user._id.toString());

    const notifications = recipients.map((userId) => ({
      recipient: userId,
      actor: req.user._id,
      type: "artifact_added",
      message: `${req.user.name} added a new artifact "${artifact.name}" to site "${site.name}"`,
      link: `/artifacts/${artifact._id}`,
    }));
    if (notifications.length) await Notification.insertMany(notifications);
  }

  res.status(201).json({ success: true, artifact });
});

// @desc    Update artifact
// @route   PUT /api/artifacts/:id
// @access  Private
const updateArtifact = asyncHandler(async (req, res) => {
  let artifact = await Artifact.findById(req.params.id);
  if (!artifact) {
    res.status(404);
    throw new Error("Artifact not found");
  }

  const isAuthorized =
    artifact.createdBy.toString() === req.user._id.toString() ||
    ["Admin", "Lead Archaeologist"].includes(req.user.role);

  if (!isAuthorized) {
    res.status(403);
    throw new Error("Not authorized to update this artifact");
  }

  artifact = await Artifact.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("site", "name siteCode")
    .populate("createdBy", "name avatar");

  res.json({ success: true, artifact });
});

// @desc    Delete artifact
// @route   DELETE /api/artifacts/:id
// @access  Private
const deleteArtifact = asyncHandler(async (req, res) => {
  const artifact = await Artifact.findById(req.params.id);
  if (!artifact) {
    res.status(404);
    throw new Error("Artifact not found");
  }

  const isAuthorized =
    req.user.role === "Admin" ||
    (req.user.role === "Lead Archaeologist" &&
      (artifact.createdBy.toString() === req.user._id.toString() ||
        req.user.role === "Lead Archaeologist"));

  if (!isAuthorized) {
    res.status(403);
    throw new Error(
      "Not authorized to delete this artifact. Requires Admin or Lead Archaeologist permissions.",
    );
  }

  await artifact.deleteOne();
  res.json({ success: true, message: "Artifact removed" });
});

// @desc    Add image to artifact
// @route   POST /api/artifacts/:id/images
// @access  Private
const addArtifactImage = asyncHandler(async (req, res) => {
  const artifact = await Artifact.findById(req.params.id);
  if (!artifact) {
    res.status(404);
    throw new Error("Artifact not found");
  }

  let imageUrl = req.body.url;
  if (req.file) {
    imageUrl = `/uploads/images/${req.file.filename}`;
  }

  artifact.images.push({
    url: imageUrl,
    caption: req.body.caption || "",
    view: req.body.view || "front",
  });

  await artifact.save();
  res.json({ success: true, artifact });
});

// @desc    Get artifact tags (all unique tags)
// @route   GET /api/artifacts/tags
// @access  Private
const getTags = asyncHandler(async (req, res) => {
  const tags = await Artifact.distinct("tags");
  res.json({ success: true, tags });
});

// @desc    Update artifact preservation status
// @route   PATCH /api/artifacts/:id/preservation-status
// @access  Private
const updatePreservationStatus = asyncHandler(async (req, res) => {
  const { preservationStatus } = req.body;
  const validStatuses = [
    "Stable",
    "Requires Treatment",
    "Under Restoration",
    "Critical",
  ];

  if (!preservationStatus || !validStatuses.includes(preservationStatus)) {
    res.status(400);
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    );
  }

  const artifact = await Artifact.findByIdAndUpdate(
    req.params.id,
    { preservationStatus },
    { new: true, runValidators: true },
  )
    .populate("site", "name siteCode")
    .populate("createdBy", "name avatar");

  if (!artifact) {
    res.status(404);
    throw new Error("Artifact not found");
  }

  res.json({ success: true, artifact });
});

module.exports = {
  getArtifacts,
  getArtifact,
  createArtifact,
  updateArtifact,
  deleteArtifact,
  addArtifactImage,
  getTags,
  updatePreservationStatus,
};
