const express = require('express');
const auth = require('../middleware/auth');
const { getProfile, updateProfile, updatePassword } = require('../controllers/user/userController');

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/updatePassword', auth, updatePassword);

module.exports = router;
