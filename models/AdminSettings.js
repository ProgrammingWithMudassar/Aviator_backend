const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  minBet: { type: Number, required: false },
  maxBet: { type: Number, required: false },
  minWinningPerBet: { type: Number, required: false },
  maxWinningPerBet: { type: Number, required: false },
  adminUpiId: { type: String, required: false },
  enableGlobalResult: { type: Boolean, default: false },
  globalProfitPercentage: { type: Number, required: false },
  howToPlay: { type: String, required: false },
  fairGameData: { type: String, required: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

module.exports = AdminSettings;
