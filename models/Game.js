const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    gameId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Store agent's userId
    crashAt: { type: Number, required: true },
    status: { type: String, required: true, enum: ["pending", "completed"] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);
