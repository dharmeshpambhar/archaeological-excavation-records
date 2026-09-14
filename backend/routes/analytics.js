const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, getSiteAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// Public GET routes
router.get('/dashboard', getDashboardAnalytics);
router.get('/site/:id', getSiteAnalytics);

module.exports = router;

