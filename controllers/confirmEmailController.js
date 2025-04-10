const User = require('../models/User');

exports.confirmEmail = async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({
    emailConfirmationToken: token,
    emailConfirmationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Токен недійсний або протермінований' });
  }

  user.isEmailConfirmed = true;
  user.emailConfirmationToken = undefined;
  user.emailConfirmationTokenExpires = undefined;
  await user.save();

  res.json({ message: 'Пошта успішно підтверджена' });
};
