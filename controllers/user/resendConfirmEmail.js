const User = require('../../models/User');
const crypto = require('crypto');
const { createEmailTemplate, sendEmail } = require('../../utils/sendEmail');

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
    user.emailConfirmationTokenExpires = Date.now() + 60 * 60 * 1000;

    await user.save();

    const confirmUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;

    const html = createEmailTemplate({
      title: 'Підтвердження пошти (повторно)',
      body: 'Ми надіслали вам нове посилання для підтвердження вашої електронної адреси.',
      buttonText: 'Підтвердити зараз',
      buttonLink: confirmUrl,
      footerNote: 'Посилання дійсне протягом 1 години.',
    });

    await sendEmail({
      to: user.email,
      subject: 'Підтвердження пошти на Omega tyres (повторно)',
      html,
    });

    res.status(200).json({ message: 'Посилання для підтвердження надіслано повторно ✅' });
  } catch (err) {
    console.error('Error resending confirmation email:', err);
    res.status(500).json({ message: 'Не вдалося надіслати лист для підтвердження' });
  }
};
