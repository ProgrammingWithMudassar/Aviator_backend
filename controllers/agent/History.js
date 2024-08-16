// controllers/agentController.js

const BalanceRequest = require('../../models/BalanceRequest');
const asyncHandler = require('express-async-handler');

// @desc    Get balance request history for an agent
// @route   GET /api/agent/balance-history
// @access  Private (Agent only)
const getBalanceHistory = asyncHandler(async (req, res) => {
	const agentId = req.user._id; // Assuming req.user contains the authenticated agent's info

	const balanceRequests = await BalanceRequest.find({ agentId }).sort({ createdAt: -1 });

	res.status(200).json({
		success: true,
		data: balanceRequests,
	});
});

module.exports = {
	getBalanceHistory,
};
