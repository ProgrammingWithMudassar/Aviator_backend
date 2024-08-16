const User = require('../../models/User');
const AgentData = require('../../models/AgentData');
const Player = require('../../models/Player');
const { default: mongoose } = require('mongoose');
const GameBet = require('../../models/GameBet');
const errorHandler = require('../../middleware/ErrorHandling');
const Plan = require('../../models/Plan');
const axios = require('axios')
const { v4: uuidv4 } = require('uuid');

const createAgent = async (req, res, next) => {
	try {
		const { name, email, password, planId, selectedAlgorithm } = req.body;

		// Step 1: Fetch the plan details using the planId
		const plan = await Plan.findById(planId);
		if (!plan) {
			return res.status(404).json({
				success: false,
				message: 'Plan not found',
			});
		}

		// Step 2: Calculate the planExpiryDate
		const currentDate = new Date();
		const planExpiryDate = new Date(currentDate);
		planExpiryDate.setDate(planExpiryDate.getDate() + plan.days); // Using plan.days to calculate expiry date

		// Step 3: Create the User
		const user = new User({ name, email, password, role: 'agent' });
		await user.save();

		// Step 4: Create the AgentData with the planExpiryDate
		const agentData = new AgentData({
			userId: user._id,
			fetch_balance_api: null,
			update_balance_api: null,
			secretTokenFromAgent: null,
			planId,
			selectedAlgorithm,
			planExpiryDate, // Include the calculated planExpiryDate
		});
		await agentData.save();

		// Step 5: Aggregate the created agent data
		const createdAgent = await User.aggregate([
			{ $match: { _id: user._id } },
			{
				$lookup: {
					from: 'agentdatas', // The name of the AgentData collection (lowercase and pluralized by default)
					localField: '_id',
					foreignField: 'userId',
					as: 'agentData',
				},
			},
			{
				$unwind: {
					path: '$agentData',
					preserveNullAndEmptyArrays: true, // This keeps the user even if they don't have corresponding agentData
				},
			},
		]);

		// Step 6: Send the response
		res.status(201).json({
			success: true,
			message: 'Agent created successfully',
			data: createdAgent[0],
		});
	} catch (err) {
		errorHandler(err, req, res, next);
	}
};

const getAllAgents = async (req, res) => {
	try {
		const agents = await User.aggregate([
			{ $match: { role: 'agent' } },
			{
				$lookup: {
					from: 'agentdatas', // Joining the agent data collection
					localField: '_id',
					foreignField: 'userId',
					as: 'agentData',
				},
			},
			{
				$unwind: {
					path: '$agentData', // Unwinding agentData array to work with individual documents
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup: {
					from: 'plans', // Joining the plans collection
					localField: 'agentData.planId',
					foreignField: '_id',
					as: 'plan',
				},
			},
			{
				$unwind: {
					path: '$plan', // Unwinding plan array
					preserveNullAndEmptyArrays: true,
				},
			},
		]);

		res.status(200).json({
			success: true,
			message: 'Get all agents',
			data: agents,
		});
	} catch (err) {
		res.status(400).json({ success: false, message: err.message });
	}
};

const getAgentById = async (req, res) => {
	try {
		const agentId = req.params.agentId;

		const agent = await User.aggregate([
			{
				$match: {
					_id: new mongoose.Types.ObjectId(agentId),
					role: 'agent',
				},
			},
			{
				$lookup: {
					from: 'agentdatas', // The name of the AgentData collection (lowercase and pluralized by default)
					localField: '_id',
					foreignField: 'userId',
					as: 'agentData',
				},
			},
			{
				$unwind: {
					path: '$agentData',
					preserveNullAndEmptyArrays: true, // This keeps the agent even if they don't have corresponding agentData
				},
			},
		]);

		if (!agent || agent.length === 0) {
			return res
				.status(404)
				.json({ success: false, message: 'Agent not found' });
		}

		res.status(200).json({
			success: true,
			message: 'Get single agent',
			data: agent[0],
		});
	} catch (err) {
		res.status(400).json({ success: false, message: err.message });
	}
};

const updateAgent = async (req, res) => {
	try {
		// Find the agent by ID
		const agent = await User.findById(req.params.agentId);

		// Check if the agent exists and has the correct role
		if (!agent || agent.role !== 'agent') {
			return res
				.status(404)
				.json({ success: false, message: 'Agent not found' });
		}

		// Extract fields to update in User and AgentData
		const { name, email, password, blocked, ...agentDataFields } = req.body;

		// Update agent fields if provided in the request body
		if (name !== undefined) agent.name = name;
		if (email !== undefined) agent.email = email;
		// if (password !== undefined) agent.password = password;
		if (blocked !== undefined) agent.blocked = blocked;

		// Save the updated agent
		await agent.save();

		// Check if there's corresponding AgentData to update
		const agentData = await AgentData.findOne({ userId: agent._id });
		if (agentData) {
			// Update fields in AgentData collection
			Object.assign(agentData, agentDataFields);
			await agentData.save();
		}

		// Use aggregation to get the updated agent with AgentData
		const updatedAgent = await User.aggregate([
			{ $match: { _id: agent._id } },
			{
				$lookup: {
					from: 'agentdatas', // The name of the AgentData collection (should match the exact collection name)
					localField: '_id',
					foreignField: 'userId',
					as: 'agentData',
				},
			},
			{
				$unwind: {
					path: '$agentData',
					preserveNullAndEmptyArrays: true, // Keep user even if they don't have corresponding agentData
				},
			},
		]);

		// Respond with the updated agent information
		res.status(200).json({
			success: true,
			message: 'Agent updated successfully',
			data: updatedAgent[0],
		});
	} catch (err) {
		// Handle errors and respond
		res.status(400).json({ success: false, message: err.message });
	}
};

const deleteAgent = async (req, res) => {
	try {
		const agent = await User.findById(req.params.agentId);
		if (!agent || agent.role !== 'agent') {
			return res
				.status(404)
				.json({ success: false, message: 'Agent not found' });
		}
		await agent.deleteOne();
		res.status(200).json({
			success: true,
			message: 'Agent deleted successfully',
		});
	} catch (err) {
		res.status(400).json({ success: false, message: err.message });
	}
};

const blockAgent = async (req, res) => {
	try {
		const agent = await User.findById(req.params.agentId);
		if (!agent || agent.role !== 'agent') {
			return res
				.status(404)
				.json({ success: false, message: 'Agent not found' });
		}
		agent.blocked = true;
		await agent.save();
		res.status(200).json({
			success: true,
			message: 'Agent blocked successfully',
		});
	} catch (err) {
		res.status(400).json({ success: false, message: err.message });
	}
};

const unblockAgent = async (req, res) => {
	try {
		const agent = await User.findById(req.params.agentId);
		if (!agent || agent.role !== 'agent') {
			return res
				.status(404)
				.json({ success: false, message: 'Agent not found' });
		}
		agent.blocked = false;
		await agent.save();
		res.status(200).json({
			success: true,
			message: 'Agent unblocked successfully',
		});
	} catch (err) {
		res.status(400).json({ success: false, message: err.message });
	}
};

const renewAgentPlan = async (req, res) => {
	try {
		// Step 1: Find the agent data by user ID
		const agentData = await AgentData.findOne({
			userId: req.params.agentId,
		});

		if (!agentData) {
			return res
				.status(404)
				.json({ success: false, message: 'Agent data not found' });
		}

		// Step 2: Fetch the new plan details using planId from the request body
		const plan = await Plan.findById(req.body.planId);

		if (!plan) {
			return res.status(404).json({
				success: false,
				message: 'Plan not found',
			});
		}

		// Step 3: Update the agent's plan details
		agentData.planId = req.body.planId;

		// Calculate the new plan expiry date based on the plan duration
		const planExpiryDate = new Date();
		planExpiryDate.setDate(planExpiryDate.getDate() + plan.days);

		agentData.planExpiryDate = planExpiryDate;

		// Step 4: Save the updated agent data
		await agentData.save();

		// Step 5: Send the success response
		res.status(200).json({
			success: true,
			message: 'Agent plan renewed successfully',
			planExpiryDate, // Include the new plan expiry date in the response
		});
	} catch (err) {
		// Handle any errors
		res.status(400).json({ success: false, message: err.message });
	}
};

const getAgentWinLoss = async (req, res) => {
	try {
		const agentId = req.params.agentId;
		const winLoss = await GameBet.aggregate([
			{ $match: { userId: agentId } },
			{
				$group: {
					_id: null,
					totalWin: {
						$sum: {
							$cond: [
								{ $eq: ['$status', 'win'] },
								'$winAmount',
								0,
							],
						},
					},
					totalLoss: {
						$sum: {
							$cond: [{ $eq: ['$status', 'loss'] }, '$amount', 0],
						},
					},
				},
			},
		]);

		res.status(200).json({
			success: true,
			data: winLoss[0] || { totalWin: 0, totalLoss: 0 },
		});
	} catch (err) {
		res.status(400).json({ success: false, message: err.message });
	}
};

const getAgentPlayers = async (req, res) => {
	try {
		const players = await Player.find({ agentId: req.params.agentId });
		res.status(200).json({
			success: true,
			data: players,
		});
	} catch (err) {
		res.status(400).json({ success: false, message: err.message });
	}
};

const fetchPlayerData = async (req, res) => {
    try {
        const agentId = req.user._id; 
		
        const agent = await AgentData.findOne({ userId: agentId });
        if (!agent) {
			return res.status(404).json({ success: false, message: 'Agent not found' });
        }
		
        const response = await axios.post(agent.fetch_balance_api, {
			secretToken: agent.secretTokenFromAgent,
        });

        if (response.data.success) {
            const playersData = response.data.players; 

            for (const player of playersData) {
                const existingPlayer = await Player.findOne({
                    mobileEmail: player?.mobileEmail,
                    agentId: agentId,
                });

                if (!existingPlayer) {
                    await Player.create({
                        userId: req.user._id, 
                        agentId: agentId,
                        mobileEmail: player.mobileEmail,
                        balance: player.balance,
                        gameToken: uuidv4(), 
                        lang: player.lang || 'en',
                        return_url: player.return_url || '',
                        totalWin: player.totalWin || 0,
                        totalLoss: player.totalLoss || 0,
                        todayWin: player.todayWin || 0,
                        todayLoss: player.todayLoss || 0,
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Player data fetched and stored successfully.',
            });
        } else {
            return res.status(400).json({
                success: false,
                message: response.data.message || 'Failed to fetch player data',
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `External API error: ${err.response?.statusText || err.message}.`,
            details: err.response?.data || err.message,
        });
    }
};

const updatePlayerData = async (req, res) => {
	const { secretTokenFromAdmin, userId, amount, type } = req.body;

	try {
		// Find the agent by the provided token
		const agent = await AgentData.findOne({ secretTokenFromAdmin });

		if (!agent) {
			return res.status(404).json({ success: false, message: 'Agent not found' });
		}

		// Make a request to the agent's update_balance_api to update player data
		const response = await axios.post(agent.update_balance_api, {
			userId,
			amount,
			type, // 'add' or 'deduct'
			secretTokenFromAgent: agent.secretTokenFromAgent,
		});

		if (response.data.success) {
			return res.status(200).json({
				success: true,
				message: 'Player balance updated successfully',
				updatedBalance: response.data.updatedBalance,
			});
		} else {
			return res.status(400).json({
				success: false,
				message: response.data.message || 'Failed to update player data',
			});
		}
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};




module.exports = {
	createAgent,
	getAllAgents,
	getAgentById,
	updateAgent,
	deleteAgent,
	blockAgent,
	unblockAgent,
	renewAgentPlan,
	getAgentWinLoss,
	getAgentPlayers,
	fetchPlayerData,
	updatePlayerData
};
