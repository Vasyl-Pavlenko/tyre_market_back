const express = require('express');
const router = express.Router();
const { serveSitemap } = require('../controllers/admin/adminController');

router.get('/sitemap.xml', serveSitemap);

module.exports = router;
