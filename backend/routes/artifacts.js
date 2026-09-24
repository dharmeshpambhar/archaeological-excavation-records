const express = require("express");
const router = express.Router();
const {
  getArtifacts,
  getArtifact,
  createArtifact,
  updateArtifact,
  deleteArtifact,
  addArtifactImage,
  getTags,
  updatePreservationStatus,
} = require("../controllers/artifactsController");
const { protect } = require("../middleware/auth");
const { canEdit, isLeadOrAdmin } = require("../middleware/role");
const upload = require("../middleware/upload");

// Public GET routes
router.get("/tags", getTags);
router.get("/", getArtifacts);
router.get("/:id", getArtifact);

// Protected write routes
router.post("/", protect, canEdit, createArtifact);
router.put("/:id", protect, canEdit, updateArtifact);
router.patch(
  "/:id/preservation-status",
  protect,
  canEdit,
  updatePreservationStatus,
);
router.delete("/:id", protect, isLeadOrAdmin, deleteArtifact);
router.post(
  "/:id/images",
  protect,
  canEdit,
  upload.single("image"),
  addArtifactImage,
);

module.exports = router;
