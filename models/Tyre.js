const mongoose = require('mongoose');
const slugify = require('slugify');

const tyreSchema = new mongoose.Schema(
  {
    brand: String,
    model: String,
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    radius: {
      type: Number,
      required: true,
    },
    season: String,
    vehicle: String,
    year: Number,
    treadDepth: {
      type: Number,
      min: 0,
      max: 12,
    },
    treadPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    city: String,
    condition: String,
    price: Number,
    quantity: Number,
    contact: String,
    description: String,
    images: [[{ url: String, width: Number }]],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    views: { type: Number, default: 0 },
    isViewed: {
      type: Boolean,
      default: false,
    },
    favoritesCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    willBeDeletedAt: {
      type: Date,
      default: function () {
        return new Date(this.expiresAt.getTime() + 90 * 24 * 60 * 60 * 1000);
      },
    },
    title: String,
    slug: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

tyreSchema.pre('save', function (next) {
  const parts = [this.brand];

  if (this.model) {
    parts.push(this.model);
  }

  parts.push(`${this.width}/${this.height} R${this.radius}`);

  this.title = parts.join(' ');

  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

tyreSchema.index({ title: 'text' });

module.exports = mongoose.model('Tyre', tyreSchema);
