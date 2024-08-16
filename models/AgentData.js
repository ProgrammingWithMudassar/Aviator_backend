const mongoose = require('mongoose');

const generateRandomAlphaString = length => {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters.charAt(randomIndex);
	}
	return result;
};

const AgentDataSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	fetch_balance_api: { type: String, default: null },
	update_balance_api: { type: String, default: null },
	secretTokenFromAdmin: {
		type: String,
		required: true,
		default: () => generateRandomAlphaString(20),
	},
	secretTokenFromAgent: { type: String, default: null },
	planId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Plan',
	},
	planExpiryDate: {
		type: Date,
	},
	selectedAlgorithm: {
		type: String,
		enum: ['egp', 'dpp', 'npa', 'random'],
		required: true,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AgentData', AgentDataSchema);
