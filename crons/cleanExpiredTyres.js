const cron = require('node-cron');
const Tyre = require('../models/Tyre');

function startTyreCleanupJob() {
  cron.schedule('0 0 * * *', async () => {
    try {
      const result = await Tyre.deleteMany({ expiresAt: { $lte: new Date() } });
      console.log(`🧹 Видалено ${result.deletedCount} прострочених оголошень`);
    } catch (err) {
      console.error('❌ Помилка при видаленні прострочених оголошень:', err);
    }
  });
}

module.exports = startTyreCleanupJob;
