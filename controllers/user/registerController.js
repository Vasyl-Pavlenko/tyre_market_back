const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST,
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_API_KEY,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Перевірка обов'язкових полів
    if (!name || !email || !password) {
      return res.status(403).json({ message: 'Будь ласка, заповніть всі поля' });
    }

    // Перевірка наявності користувача
    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(403).json({ message: 'Email вже зареєстровано' });
    }

    // Хешування пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Генерація токена для підтвердження email
    const emailConfirmationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = Date.now() + 60 * 60 * 1000; // 1 година

    // Створення користувача
    const newUser = new User({
      name,
      email,
      passwordHash,
      emailConfirmationToken,
      emailConfirmationTokenExpires: tokenExpires,
      isEmailConfirmed: false,
    });

    await newUser.save();

    // URL для підтвердження email
    const confirmUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${emailConfirmationToken}`;

    // Надсилання листа з підтвердженням
    await transporter.sendMail({
      from: process.env.BREVO_FROM_EMAIL,
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
