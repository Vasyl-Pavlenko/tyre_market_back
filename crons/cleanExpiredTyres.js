const cron = require('node-cron');
const Tyre = require('../models/Tyre');

const { saveSitemapToFile } = require('../scripts/generateSitemap');
function startTyreCleanupJob() {
  cron.schedule('0 0 * * *', async () => {
    try {
      const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

      const result = await Tyre.deleteMany({
        isActive: false,
        isDeleted: true,
        expiresAt: { $lte: new Date(Date.now() - THREE_MONTHS_MS) },
      });

      console.log(`🧹 Видалено ${result.deletedCount} прострочених оголошень`);

      await saveSitemapToFile();
      console.log('🗺 Sitemap оновлено після очищення шин');
    } catch (err) {
      console.error('❌ Помилка при видаленні прострочених оголошень або оновленні sitemap:', err);
    }
  });
}

module.exports = startTyreCleanupJob;
