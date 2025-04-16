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
    const tokenExpires = Date.now() + 60 * 60 * 1000;

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
      subject: 'Підтвердження реєстрації на сайті Omega Tyres',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 24px;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 32px;">
            <h2 style="color: #1e3a8a; text-align: center;">Ласкаво просимо до Omega Tyres! 🚗</h2>
            <p style="font-size: 16px; color: #333;">
              Дякуємо за реєстрацію на нашому сервісі. Щоб завершити процес, будь ласка, підтвердіть вашу електронну адресу.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${confirmUrl}" style="display: inline-block; background-color: #1e3a8a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
                Підтвердити email
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              Посилання дійсне протягом 1 години. Якщо ви не реєструвались на сайті Omega Tyres, просто ігноруйте цей лист.
            </p>
            <hr style="margin: 32px 0;">
            <p style="font-size: 12px; color: #aaa; text-align: center;">
              Omega Tyres – ваш надійний маркетплейс шин.
            </p>
          </div>
        </div>
      `,
    });

    res.status(201).json({ message: 'Реєстрація успішна. Перевірте пошту.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};
