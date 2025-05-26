const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isEmailConfirmed: { type: Boolean, default: false },
  emailConfirmationToken: String,
  emailConfirmationTokenExpires: Date,
  isVerified: { type: Boolean, default: false },
  city: { type: String },
  phone: { type: String },
  phoneVerified: { type: Boolean, default: false },
  phoneToken: { type: String },
  phoneTokenExpires: { type: Date },
  phoneTokenAttempts: { type: Number, default: 0 },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tyre' }],
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
