const mongoose = require('mongoose');

const tyreSchema = new mongoose.Schema(
  {
    brand: String,
    size: String,
    season: String,
    vehicle: String,
    year: Number,
    treadDepth: Number,
    city: String,
    condition: String,
    price: Number,
    contact: String,
    description: String,
    images: [String],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    views: { type: Number, default: 0 }, // ✅ 1. Кількість переглядів
    favoritesCount: { type: Number, default: 0 }, // ✅ 3. Кількість додавань до обраного
    isActive: { type: Boolean, default: true }, // ✅ 4. Активне/неактивне оголошення
    isDeleted: { type: Boolean, default: false }, // ✅ 5. М’яке видалення
    willBeDeletedAt: {
      type: Date,
      default: function () {
        return new Date(this.expiresAt.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 місяці після закінчення
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Tyre', tyreSchema);
