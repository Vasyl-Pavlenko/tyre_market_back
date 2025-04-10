const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_API_KEY,
  },
});

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email вже зареєстровано' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const emailConfirmationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = Date.now() + 60 * 60 * 1000; // 1 година

    const newUser = new User({
      email,
      passwordHash,
      emailConfirmationToken,
      emailConfirmationTokenExpires: tokenExpires,
      isEmailConfirmed: false,
    });

    await newUser.save();

    const confirmUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${emailConfirmationToken}`;

    await transporter.sendMail({
      to: newUser.email,
      subject: 'Підтвердження пошти',
      html: `<p>Натисніть <a href="${confirmUrl}">сюди</a> для підтвердження пошти. Посилання дійсне 1 годину.</p>`,
    });

    res.status(201).json({ message: 'Реєстрація успішна. Перевірте пошту.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Користувача не знайдено' });
    }

    // ✋ Перевірка, чи підтверджена пошта
    if (!user.isEmailConfirmed) {
      return res.status(403).json({ message: 'Підтвердіть пошту, перш ніж увійти' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Невірний логін чи пароль' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Щось пішло не так' });
  }
};
