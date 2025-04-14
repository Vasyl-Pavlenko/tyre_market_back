const User = require('../../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Транспортер для відправки email
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

exports.resendConfirmation = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Некоректна email адреса' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Користувача з такою адресою не знайдено' });
    }

    if (user.isEmailConfirmed) {
      return res.status(400).json({ message: 'Email вже підтверджено' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.emailConfirmationToken = token;
    user.emailConfirmationTokenExpires = Date.now() + 60 * 60 * 1000; // 1 година

    await user.save();

    const confirmUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;

    await transporter.sendMail({
      to: user.email,
      subject: 'Підтвердження пошти (повторно)',
      html: `<p>Натисніть <a href="${confirmUrl}">сюди</a>, щоб підтвердити пошту. Посилання дійсне 1 годину.</p>`,
    });

    res.status(200).json({ message: 'Посилання для підтвердження надіслано повторно ✅' });
  } catch (err) {
    console.error('Error resending confirmation email:', err);
    res.status(500).json({ message: 'Не вдалося надіслати лист для підтвердження' });
  }
};
