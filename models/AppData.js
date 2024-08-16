const mongoose = require("mongoose");

const appDataSchema = new mongoose.Schema(
  {
    minBet: { type: Number, required: true },
    maxBet: { type: Number, required: true },
    UPI_ID: { type: String, required: true },
    maxWinBetforOneBet: { type: Number, required: true },
    howToPlayData: { type: String, required: true },
    provablyFairdata: { type: String, required: true },
    EnableGlobalResult: { type: Boolean, default: true },
    GlobalProfitPercentage: { type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppData", appDataSchema);
