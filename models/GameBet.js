// models/GameBet.js

const mongoose = require("mongoose");

const gameBetSchema = new mongoose.Schema(
  {
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    winAmount: { type: Number, default: 0 },
    autoClaimAt: { type: Number },
    claimedAt: { type: Number },
    status: { type: String, required: true, enum: ["pending", "win", "loss"] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GameBet", gameBetSchema);
