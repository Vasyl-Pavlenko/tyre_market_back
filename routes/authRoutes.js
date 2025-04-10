const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { confirmEmail } = require('../controllers/confirmEmailController');
const { resendConfirmation } = require('../controllers/resendConfirmEmail');

router.post('/register', register);
router.get('/confirm-email', confirmEmail);
router.post('/resend-confirmation', resendConfirmation);
router.post('/login', login);


module.exports = router;
