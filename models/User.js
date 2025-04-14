const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isEmailConfirmed: { type: Boolean, default: false },
  emailConfirmationToken: String,
  emailConfirmationTokenExpires: Date,
});

module.exports = mongoose.model('User', userSchema);
