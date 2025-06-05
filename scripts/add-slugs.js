require('dotenv').config();
const mongoose = require('mongoose');
const Tyre = require('../models/Tyre');

function generateSlug(tyre) {
  const title = tyre.title || 'tyre';
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function addSlugToAllTyres() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Підключено до MongoDB');

    const tyres = await Tyre.find({ $or: [{ slug: { $exists: false } }, { slug: '' }] });

    console.log(`Знайдено шин без slug: ${tyres.length}`);

    for (const tyre of tyres) {
      tyre.slug = generateSlug(tyre);
      await tyre.save();
      console.log(`✅ Додано slug для: ${tyre._id} → ${tyre.slug}`);
    }

    console.log('🎉 Усі slug згенеровано!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Помилка під час генерації slug:', err);
    process.exit(1);
  }
}

addSlugToAllTyres();
