// models/Player.js

const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mobileEmail: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    gameToken: { type: String, required: true, unique: true },
    lang: { type: String, default: "en" },
    return_url: { type: String },
    totalWin: { type: Number, default: 0 }, 
    totalLoss: { type: Number, default: 0 },
    todayWin: { type: Number, default: 0 },
    todayLoss: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Player", playerSchema);
