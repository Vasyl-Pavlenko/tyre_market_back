const User = require('../../models/User');
const bcrypt= require('bcryptjs');

// Отримання поточного користувача
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    res.json(user);
  } catch (err) {
    console.error('Помилка при отриманні профілю:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// 🔄 Оновлення профілю: імʼя, телефон, місто
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, city } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    if (name) {
      user.name = name;
    }

    if (phone) {
      user.phone = phone;
    }

    if (city) {
      user.city = city;
    }

    await user.save();

    res.json({ message: 'Профіль оновлено', user });
  } catch (err) {
    console.error('Помилка при оновленні профілю:', err);
    res.status(500).json({ message: 'Не вдалося оновити профіль' });
  }
};

// 🔒 Зміна пароля
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Старий та новий пароль обовʼязкові' });
    }

    // Знайдемо користувача за id з токена
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    // Перевірка на відповідність старого пароля
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Невірний старий пароль' });
    }

    // Генерація нового хешу для пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Оновлення пароля в базі
    user.passwordHash = hashedPassword; // Оновлення passwordHash
    await user.save();

    res.json({ message: 'Пароль успішно змінено' });
  } catch (err) {
    console.error('Помилка при зміні пароля:', err);
    res.status(500).json({ message: 'Не вдалося змінити пароль' });
  }
};


