const cron = require('node-cron');
const generateSitemap = require('../scripts/generateSitemap');

cron.schedule('0 3 * * *', async () => {
  try {
    await generateSitemap();
    console.log('🗺 Sitemap автоматично оновлено (cron)');
  } catch (err) {
    console.error('❌ Помилка при оновленні sitemap (cron):', err);
  }
});
