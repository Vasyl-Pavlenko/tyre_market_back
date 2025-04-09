require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');

const authRoutes = require('./routes/authRoutes');
const tyreRoutes = require('./routes/tyreRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Налаштування multer для обмеження розміру файлів
const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // Максимальний розмір файлів 2 МБ
});

// 🔌 Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); 

// 🔗 MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('🔗 Підключено до MongoDB'))
  .catch((err) => console.error('❌ MongoDB помилка:', err));

// 📦 Роути
app.use('/api/auth', authRoutes);
app.use('/api/tyres', tyreRoutes);

// 🚀 Старт
app.listen(PORT, () => {
  console.log(`✅ Сервер запущено на http://localhost:${PORT}`);
});
