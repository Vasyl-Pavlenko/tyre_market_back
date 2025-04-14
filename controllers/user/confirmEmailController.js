const User = require('../../models/User');

exports.confirmEmail = async (req, res) => {
  const { token } = req.params;

  try {
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Невалідний токен' });
    }

    const user = await User.findOne({
      emailConfirmationToken: token,
      emailConfirmationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Токен недійсний або протермінований. Будь ласка, запросіть новий.',
      });
    }

    user.isEmailConfirmed = true;
    user.emailConfirmationToken = undefined;
    user.emailConfirmationTokenExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Пошта успішно підтверджена ✅' });
  } catch (err) {
    console.error('Error confirming email:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};
