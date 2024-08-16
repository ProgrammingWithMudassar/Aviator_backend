const mongoose = require("mongoose");

const balanceRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amountPaid: { type: Number, required: true },
    upiId: { type: String, required: true },
    utr: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const BalanceRequest = mongoose.model("BalanceRequest", balanceRequestSchema);

module.exports = BalanceRequest;
