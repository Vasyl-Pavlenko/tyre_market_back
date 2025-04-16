const express = require('express');
const auth = require('../middleware/auth');
const { updateProfile, getProfile, changePassword } = require('../controllers/user/profileController');

const router = express.Router();

router.get('/', auth, getProfile);
router.put('/', auth, updateProfile);
router.put('/password', auth, changePassword);

module.exports = router;
