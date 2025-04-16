const express = require('express');
const auth = require('../middleware/auth');
const { sendPhoneCode, verifyPhoneCode } = require('../controllers/user/phoneController');

const router = express.Router();


router.post('/send', auth, sendPhoneCode);

router.post('/verify', auth, verifyPhoneCode);

module.exports = router;
