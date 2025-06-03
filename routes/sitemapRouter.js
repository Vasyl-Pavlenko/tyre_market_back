const express = require('express');
const router = express.Router();
const { getSiteMap } = require('../controllers/admin/adminController');

router.get('/', getSiteMap);

module.exports = router;
