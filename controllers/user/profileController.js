const bcrypt = require('bcryptjs');
const User = require('../../models/User');

// Оновлення імені, міста та телефону
exports.updateProfile = async (req, res) => {
  try {
    const { name, city, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Імʼя обовʼязкове' });
    }

    await User.findByIdAndUpdate(req.user.id, { name, city, phone });

    res.json({ message: 'Профіль оновлено' });
  } catch (err) {
    console.error('Помилка при оновленні профілю:', err);
    res.status(500).json({ message: 'Не вдалося оновити профіль' });
  }
};

// Отримання профілю
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -__v');

    res.json(user);
  } catch (err) {
    console.error('Помилка при отриманні профілю:', err);
    res.status(500).json({ message: 'Не вдалося отримати профіль' });
  }
};

// Зміна пароля
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Введіть старий та новий пароль' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Старий пароль невірний' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({ message: 'Пароль змінено успішно' });
  } catch (err) {
    console.error('Помилка при зміні пароля:', err);
    res.status(500).json({ message: 'Не вдалося змінити пароль' });
  }
};
