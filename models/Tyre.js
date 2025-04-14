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
  },
  { timestamps: true },
);

module.exports = mongoose.model('Tyre', tyreSchema);
