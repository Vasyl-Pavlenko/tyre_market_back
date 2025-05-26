const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { createEmailTemplate, sendEmail } = require('../../utils/sendEmail');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: 'Лист для відновлення пароля, якщо такий користувач існує, було надіслано',
      });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const html = createEmailTemplate({
      title: 'Запит на скидання пароля',
      body: 'Щоб скинути пароль, натисніть кнопку нижче. Якщо ви не надсилали цей запит, просто ігноруйте лист.',
      buttonText: 'Скинути пароль',
      buttonLink: resetLink,
      footerNote: 'Посилання дійсне протягом 1 години.',
    });

    await sendEmail({
      to: user.email,
      subject: 'Скидання пароля на Omega Tyres',
      html,
    });

    res.json({ message: 'Лист для відновлення пароля надіслано' });
  } catch (err) {
    console.error('Помилка при скиданні пароля:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({ message: 'Пароль успішно змінено' });
  } catch (err) {
    console.error('Помилка при зміні пароля через токен:', err);
    res.status(400).json({ message: 'Недійсний або протермінований токен' });
  }
};
