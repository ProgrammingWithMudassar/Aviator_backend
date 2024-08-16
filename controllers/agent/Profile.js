const User = require('../../models/User');
const Plan = require('../../models/Plan');
const AgentData = require('../../models/AgentData');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

const changePassword = async (req, res) => {
    const { newPassword, confirmPassword } = req.body;

    console.log("newPassword");

    try {
        // Validate the new passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New password and confirm password do not match.' });
        }

        const user = await User.findById(req.user._id);

        user.password = await bcrypt.hash(newPassword, 8);
        await user.save();

        res.json({ message: 'Password updated successfully.', status:201 });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAgentProfile = async (req, res) => {
    try {
        const agents = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id),
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

        if (agents.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: 'Agent not found' });
        }

        const agent = agents[0];

        if (!agent || agent.role !== 'agent') {
            return res
                .status(404)
                .json({ success: false, message: 'Agent not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Agent profile retrieved successfully',
            data: agent,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// const updateAgentProfile = async (req, res) => {
// 	try {
// 		const agent = await User.findById(req.user._id);
// 		if (!agent || agent.role !== 'agent') {
// 			return res
// 				.status(404)
// 				.json({ success: false, message: 'Agent not found' });
// 		}

// 		const agentData = await AgentData.findOne({ userId: agent._id });
// 		if (!agentData) {
// 			return res
// 				.status(404)
// 				.json({ success: false, message: 'Agent data not found' });
// 		}

// 		const {
// 			name,
// 			email,
// 			password,
// 			fetch_balance_api,
// 			update_balance_api,
// 			secretTokenFromAgent,
// 			maxAllowedPlayers,
// 			selectedAlgorithm,
// 			planExpiryDate,
// 		} = req.body;

// 		// Update User fields
// 		if (name) agent.name = name;
// 		if (email) agent.email = email;
// 		if (password) {
// 			const salt = await bcrypt.genSalt(10);
// 			agent.password = await bcrypt.hash(password, salt);
// 		}

// 		// Update AgentData fields
// 		if (fetch_balance_api) agentData.fetch_balance_api = fetch_balance_api;
// 		if (update_balance_api)
// 			agentData.update_balance_api = update_balance_api;
// 		if (secretTokenFromAgent)
// 			agentData.secretTokenFromAgent = secretTokenFromAgent;
// 		if (maxAllowedPlayers) agentData.maxAllowedPlayers = maxAllowedPlayers;
// 		if (selectedAlgorithm) agentData.selectedAlgorithm = selectedAlgorithm;
// 		if (planExpiryDate) agentData.planExpiryDate = planExpiryDate;

// 		await agent.save();
// 		await agentData.save();

// 		res.status(200).json({
// 			success: true,
// 			message: 'Agent profile updated successfully',
// 			data: {
// 				...agent._doc,
// 				agentData: agentData,
// 			},
// 		});
// 	} catch (err) {
// 		res.status(500).json({ success: false, message: err.message });
// 	}
// };

const getAgentCurrentPlan = async (req, res) => {
    try {
        const agentData = await AgentData.findOne({ userId: req.user._id });

        if (!agentData) {
            return res.status(404).json({
                success: false,
                message: 'Agent data not found',
            });
        }

        const plan = await Plan.findById(agentData.planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found for this agent',
            });
        }

        // Step 7: Send the agent's current plan details in the response
        res.status(200).json({
            success: true,
            data: {
                agentData,
                plan,
            },
        });
    } catch (err) {
        // Handle any errors
        res.status(500).json({
            success: false,
            message:
                'An error occurred while retrieving the agent’s current plan.',
        });
    }
};

const updateAgentProfile = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        fetch_balance_api,
        update_balance_api,
        secretTokenFromAdmin,
        secretTokenFromAgent,  // Added this field
        selectedAlgorithm
    } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;

        await user.save();

        const agentData = await AgentData.findOne({ userId: req.user._id });

        if (!agentData) {
            return res.status(404).json({ success: false, message: 'Agent data not found' });
        }

        agentData.fetch_balance_api = fetch_balance_api || agentData.fetch_balance_api;
        agentData.update_balance_api = update_balance_api || agentData.update_balance_api;
        agentData.secretTokenFromAdmin = secretTokenFromAdmin || agentData.secretTokenFromAdmin;
        agentData.secretTokenFromAgent = secretTokenFromAgent || agentData.secretTokenFromAgent; // Update field
        agentData.selectedAlgorithm = selectedAlgorithm || agentData.selectedAlgorithm;

        await agentData.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user, agentData },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
        });
    }
});


module.exports = {
    getAgentProfile,
    updateAgentProfile,
    getAgentCurrentPlan,
    changePassword
};
