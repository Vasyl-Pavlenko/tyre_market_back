require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');

const authRoutes = require('./routes/authRoutes');
const tyreRoutes = require('./routes/tyreRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const phoneRoutes = require('./routes/phoneRoutes'); 
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Налаштування multer для обмеження розміру файлів
const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 },
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Файл занадто великий! Максимальний розмір - 2 МБ' });
    }
  }
  next(err);
});

// 🕐 Cron job
const startTyreCleanupJob = require('./crons/cleanExpiredTyres'); // ✅

// 🧹 Запуск cron job
startTyreCleanupJob(); // ✅
console.log('🧹 Cron job для очищення шин активовано');

// 🔌 Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 🔗 MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('🔗 Підключено до MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB помилка:', err);
    process.exit(1);
  });
  
// 📡 Ping
  app.get('/api/ping', (req, res) => {
    res.status(200).json({ message: 'pong' });
  });

// 📦 Роути
app.use('/api/auth', authRoutes);
app.use('/api/tyres', tyreRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/phone', phoneRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// 🚀 Старт
app.listen(PORT, () => {
  console.log(`✅ Сервер запущено на http://localhost:${PORT}`);
});
