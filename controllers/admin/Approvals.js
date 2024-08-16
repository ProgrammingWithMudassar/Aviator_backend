// controllers/adminController.js

const BalanceRequest = require('../../models/BalanceRequest');
const User = require('../../models/User');
const asyncHandler = require('express-async-handler');

const approveBalanceRequest = asyncHandler(async (req, res) => {
	const { requestId } = req.params;
	
	// const adminId = req.user._id; 
	
	const balanceRequest = await BalanceRequest.findById(requestId);
	
	if (!balanceRequest || balanceRequest.status !== 'pending') {
		return res.status(404).json({ success: false, message: 'Balance request not found or already processed' });
	}
	
    const agent = await User.findById(balanceRequest.userId);
	console.log(agent);
	agent.balance += balanceRequest.amountPaid;
	await agent.save();

	balanceRequest.status = 'approved';
	// balanceRequest.approvedByAdminId = adminId;
	balanceRequest.approvedAt = Date.now();
	await balanceRequest.save();

	res.status(200).json({
		success: true,
		message: 'Balance request approved successfully',
		data: balanceRequest,
	});
});



const rejectBalanceRequest = asyncHandler(async (req, res) => {
	const { requestId } = req.params;

	const balanceRequest = await BalanceRequest.findById(requestId);

	if (!balanceRequest || balanceRequest.status !== 'pending') {
		return res.status(404).json({ success: false, message: 'Balance request not found or already processed' });
	}

	// Update the balance request status
	balanceRequest.status = 'rejected';
	balanceRequest.rejectedAt = Date.now();
	await balanceRequest.save();

	res.status(200).json({
		success: true,
		message: 'Balance request rejected successfully',
		data: balanceRequest,
	});
});

module.exports = {
	approveBalanceRequest,
	rejectBalanceRequest,
};
