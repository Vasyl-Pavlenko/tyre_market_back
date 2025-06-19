require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const streamifier = require('streamifier');

const { cloudinary } = require('./utils/cloudinary');
const { saveSitemapToFile } = require('./scripts/generateSitemap');
const { preparePublicFolder } = require('./utils/publicFolder');

const authRoutes = require('./routes/authRoutes');
const tyreRoutes = require('./routes/tyreRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const phoneRoutes = require('./routes/phoneRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sitemapRouter = require('./routes/sitemapRouter');
const seoPages = require('./routes/seoPages.js');

const startTyreCleanupJob = require('./crons/cleanExpiredTyres');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Multer: зберігання в памʼяті
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// Завантаження зображення
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Файл не передано' });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'tyres',
          format: 'webp',
          transformation: [{ width: 1600, crop: 'limit' }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    res.status(200).json({
      images: [
        {
          width: result.width,
          url: result.secure_url,
          public_id: result.public_id,
        },
      ],
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'Помилка при завантаженні зображення' });
  }
});

// Обробка помилок Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Файл занадто великий! Максимальний розмір - 2 МБ' });
  }
  next(err);
});

// Підключення до MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('🔗 Підключено до MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB помилка:', err);
    process.exit(1);
  });

// Запуск cron job для очищення шин
startTyreCleanupJob();
console.log('🧹 Cron job для очищення шин активовано');

// Запуск cron job для генерації sitemap
require('./crons/cronSitemap');
console.log('🗺 Cron job для генерації sitemap активовано');

// Підготовка папки public та генерація sitemap на старті
(async () => {
  try {
    preparePublicFolder();
    await saveSitemapToFile();
  } catch (error) {
    console.error('❌ Error saving sitemap at startup:', error);
  }
})();

// Пінг для перевірки, що сервер працює
app.get('/api/ping', (req, res) => res.status(200).json({ message: 'pong' }));

// Роутинг
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/tyres', tyreRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/phone', phoneRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/sitemap.xml', sitemapRouter);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер запущено на http://localhost:${PORT}`);
});
