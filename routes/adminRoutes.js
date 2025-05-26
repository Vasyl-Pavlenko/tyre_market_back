const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');
const {
  getStats,
  getDailyListings,
  getDailyUsers,
  getListingCategories,
  getListingStatus,
} = require('../controllers/admin/adminController');

router.get('/stats', isAdmin, getStats);
router.get('/stats/daily-listings', isAdmin, getDailyListings);
router.get('/stats/daily-users', isAdmin, getDailyUsers);
router.get('/stats/listing-categories', isAdmin, getListingCategories);
router.get('/stats/listing-status', isAdmin, getListingStatus);

module.exports = router;
