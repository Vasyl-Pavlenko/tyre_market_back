const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// @desc   Отримати поточний профіль користувача
// @route  GET /api/user/profile
// @access Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -__v');

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    res.json(user);
  } catch (err) {
    console.error('Помилка при отриманні профілю:', err);
    res.status(500).json({ message: 'Не вдалося отримати профіль' });
  }
};

// @desc   Оновити профіль користувача
// @route  PUT /api/user/profile
// @access Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, city } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Імʼя обовʼязкове' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    user.name = name.trim();
    user.phone = phone || '';
    user.city = city || '';

    await user.save();

    res.json({ message: 'Профіль оновлено', user });
  } catch (err) {
    console.error('Помилка при оновленні профілю:', err);
    res.status(500).json({ message: 'Не вдалося оновити профіль' });
  }
};

// @desc   Змінити пароль користувача
// @route  PUT /api/user/password
// @access Private
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    // Перевірка наявності всіх полів
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Всі поля повинні бути заповнені' });
    }

    // Перевірка, чи новий пароль співпадає з підтвердженням пароля
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Новий пароль не збігається з підтвердженням пароля' });
    }

    // Перевірка, чи новий пароль відрізняється від старого
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Новий пароль не може бути таким самим, як старий' });
    }

    // Знайти користувача по ID
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    // Перевірка, чи правильний старий пароль
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Невірний поточний пароль' });
    }

    // Хешування нового пароля
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Оновлення пароля користувача
    user.passwordHash = hashedPassword;
    await user.save();

    res.json({ message: 'Пароль успішно змінено' });
  } catch (err) {
    console.error('Помилка при зміні пароля:', err);
    res.status(500).json({ message: 'Не вдалося змінити пароль' });
  }
};
