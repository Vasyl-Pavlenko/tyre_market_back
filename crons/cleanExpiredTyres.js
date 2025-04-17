const cron = require('node-cron');
const Tyre = require('../models/Tyre');

function startTyreCleanupJob() {
  cron.schedule('0 0 * * *', async () => {
    try {
      // видаляємо через 3 місяці після завершення
      const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

      const result = await Tyre.deleteMany({
        isActive: false,
        isDeleted: true,
        expiresAt: { $lte: new Date(Date.now() - THREE_MONTHS_MS) },
      });
      
      console.log(`🧹 Видалено ${result.deletedCount} прострочених оголошень`);
    } catch (err) {
      console.error('❌ Помилка при видаленні прострочених оголошень:', err);
    }
  });
}

module.exports = startTyreCleanupJob;
