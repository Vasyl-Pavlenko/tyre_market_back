const express = require('express');
const auth = require('../middleware/auth');
const { getMe, updateProfile, changePassword } = require('../controllers/user/userController');

const router = express.Router();

router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.patch('/change-password', auth, changePassword);

module.exports = router;
