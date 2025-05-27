require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const tyreRoutes = require('./routes/tyreRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const phoneRoutes = require('./routes/phoneRoutes'); 
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Підключаємо CORS до всіх маршрутів, ДО роутів і middleware
app.use(cors());

// Розбір JSON (якщо потрібен)
app.use(express.json({ limit: '10mb' }));

// Зберігання файлів у пам'яті
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// Маршрут завантаження
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { buffer, originalname } = req.file;

    const fileNameWithoutExt = path.parse(originalname).name;
    const outputFileName = `${fileNameWithoutExt}-${Date.now()}.webp`;
    const outputPath = path.join(__dirname, 'uploads', outputFileName);
    const uploadDir = path.join(__dirname, 'uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    await sharp(buffer).resize({ width: 800 }).toFormat('webp').toFile(outputPath);

    return res.status(200).json({ url: `/uploads/${outputFileName}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Помилка при обробці зображення' });
  }
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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🚀 Старт
app.listen(PORT, () => {
  console.log(`✅ Сервер запущено на http://localhost:${PORT}`);
});
