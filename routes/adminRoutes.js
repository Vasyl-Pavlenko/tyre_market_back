const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');
const {
  getStats,
  getDailyListings,
  getDailyUsers,
  getListingCategories,
  getListingStatus,
  getSiteMap,
} = require('../controllers/admin/adminController');

router.get('/stats', isAdmin, getStats);
router.get('/stats/daily-listings', isAdmin, getDailyListings);
router.get('/stats/daily-users', isAdmin, getDailyUsers);
router.get('/stats/listing-categories', isAdmin, getListingCategories);
router.get('/stats/listing-status', isAdmin, getListingStatus);
router.get('/generate-sitemap', getSiteMap);

module.exports = router;
