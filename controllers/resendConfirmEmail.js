exports.resendConfirmation = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.isEmailConfirmed) {
    return res.status(400).json({ message: 'Користувача не знайдено або вже підтверджено' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.emailConfirmationToken = token;
  user.emailConfirmationTokenExpires = Date.now() + 60 * 60 * 1000;

  await user.save();

  const confirmUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;

  await transporter.sendMail({
    to: user.email,
    subject: 'Підтвердження пошти (повторно)',
    html: `<p>Натисніть <a href="${confirmUrl}">сюди</a> для підтвердження пошти. Посилання дійсне 1 годину.</p>`,
  });

  res.json({ message: 'Посилання відправлено повторно' });
};
