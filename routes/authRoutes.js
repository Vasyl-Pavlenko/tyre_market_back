const express = require('express');
const router = express.Router();

const { register } = require('../controllers/user/registerController');
const { login } = require('../controllers/user/loginController');
const { confirmEmail } = require('../controllers/user/confirmEmailController');
const { resendConfirmation } = require('../controllers/user/resendConfirmEmail');

const { forgotPassword, resetPassword } = require ('../controllers/auth/authController');

// 👉 Реєстрація користувача
router.post('/register', register);

// 👉 Підтвердження email (через токен)
router.get('/confirm-email/:token', confirmEmail);

// 👉 Повторне надсилання email підтвердження
router.post('/resend-confirmation', resendConfirmation);

// 👉 Вхід
router.post('/login', login);

// 👉 Відновлення пароля
router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

module.exports = router;
