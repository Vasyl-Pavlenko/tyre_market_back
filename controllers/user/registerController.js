const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { createEmailTemplate, sendEmail } = require('../../utils/sendEmail');

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

    const html = createEmailTemplate({
      title: 'Ласкаво просимо до Omega Tyres!',
      body: 'Дякуємо за реєстрацію. Щоб завершити процес, підтвердіть вашу електронну адресу.',
      buttonText: 'Підтвердити email',
      buttonLink: confirmUrl,
      footerNote:
        'Посилання дійсне протягом 1 години. Якщо ви не реєструвались, просто ігноруйте цей лист.',
    });

    // Надсилання листа з підтвердженням
    await sendEmail({
      to: newUser.email,
      subject: 'Підтвердження реєстрації на сайті Omega Tyres',
      html,
    });

    res.status(201).json({ message: 'Реєстрація успішна. Перевірте пошту.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};
