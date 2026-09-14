const express = require('express');
const router = express.Router();
const {
  getSites,
  getSitesForMap,
  getSite,
  createSite,
  updateSite,
  deleteSite,
  addSitePhoto,
  addTeamMember,
  removeTeamMember,
} = require('../controllers/sitesController');
const { protect } = require('../middleware/auth');
const { isLeadOrAdmin, canEdit } = require('../middleware/role');
const upload = require('../middleware/upload');

// Public GET routes — no auth required to view data
router.get('/map', getSitesForMap);
router.get('/', getSites);
router.get('/:id', getSite);

// Protected write routes
router.post('/', protect, isLeadOrAdmin, createSite);
router.put('/:id', protect, isLeadOrAdmin, updateSite);
router.delete('/:id', protect, isLeadOrAdmin, deleteSite);
router.post('/:id/photos', protect, canEdit, upload.single('photo'), addSitePhoto);
router.post('/:id/team', protect, isLeadOrAdmin, addTeamMember);
router.delete('/:id/team/:userId', protect, isLeadOrAdmin, removeTeamMember);

module.exports = router;
