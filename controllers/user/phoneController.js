const crypto = require('crypto');
const User = require('../../models/User');
const { sendSMS } = require('../../utils/smsClient');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Надіслати код підтвердження
exports.sendPhoneCode = async (req, res) => {
  try {
    const { phone } = req.body;

    const rawPhone = phone.replace(/\D/g, '');

    let normalizedPhone = null;
    
    if (/^0\d{9}$/.test(rawPhone)) {
      normalizedPhone = '+38' + rawPhone;
    } else if (/^380\d{9}$/.test(rawPhone)) {
      normalizedPhone = '+' + rawPhone;
    } else if (/^\+380\d{9}$/.test(phone)) {
      normalizedPhone = phone;
    } else {
      return res.status(400).json({ message: 'Некоректний номер телефону' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    if (user.phoneToken && user.phoneTokenExpires > new Date()) {
      return res.status(400).json({
        message: 'Код вже відправлено. Будь ласка, зачекайте.',
      });
    }

    const rawToken = crypto.randomInt(100000, 999999).toString();
    const hashedToken = hashToken(rawToken);

    user.phone = phone;
    user.phoneToken = hashedToken;
    user.phoneTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    user.phoneTokenAttempts = 0;
    await user.save();

    const message = `Ваш код підтвердження: ${rawToken}`;

    await sendSMS({ phone, message });

    res.json({ message: 'Код відправлено на телефон' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не вдалося надіслати код' });
  }
};

// Підтвердження коду
exports.verifyPhoneCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Код обовʼязковий' });
    }

    const user = await User.findById(req.user.id);

    if (!user || !user.phoneToken || !user.phoneTokenExpires) {
      return res.status(400).json({ message: 'Не знайдено код підтвердження' });
    }

    if (user.phoneTokenExpires < new Date()) {
      return res.status(400).json({ message: 'Код прострочений' });
    }

    if (user.phoneTokenAttempts >= 5) {
      return res
        .status(429)
        .json({ message: 'Перевищено кількість спроб. Надішліть код повторно.' });
    }

    const hashedInput = hashToken(code);

    if (hashedInput !== user.phoneToken) {
      user.phoneTokenAttempts = (user.phoneTokenAttempts || 0) + 1;
      await user.save();

      return res.status(400).json({ message: 'Невірний код' });
    }

    // Підтвердження
    user.phoneVerified = true;
    user.phoneToken = undefined;
    user.phoneTokenExpires = undefined;
    user.phoneTokenAttempts = undefined;
    await user.save();

    console.log(`✅ Користувач ${user._id} підтвердив телефон ${user.phone}`);

    res.json({ message: 'Телефон успішно підтверджено' });
  } catch (err) {
    console.error('Помилка при верифікації телефону:', err);
    res.status(500).json({ message: 'Не вдалося підтвердити телефон' });
  }
};
