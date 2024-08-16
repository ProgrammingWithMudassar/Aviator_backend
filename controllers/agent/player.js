const User = require('../../models/User');
const AgentData = require('../../models/AgentData');
const Player = require('../../models/Player');

// API to add credentials for an agent
const addAgentCredentials = async (req, res) => {
  const { fetch_balance_api, update_balance_api, secretTokenFromAgent, userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required',
    });
  }

  try {
    let agentData = await AgentData.findOne({ userId });

    if (!agentData) {
      agentData = new AgentData({
        userId,
        fetch_balance_api,
        update_balance_api,
        secretTokenFromAgent,
      });
    } else {
      agentData.fetch_balance_api = fetch_balance_api;
      agentData.update_balance_api = update_balance_api;
      agentData.secretTokenFromAgent = secretTokenFromAgent;
    }

    await agentData.save();

    return res.status(200).json({
      success: true,
      message: 'Agent credentials added/updated successfully',
      data: agentData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAgentCredentials = async (req, res) => {
  const { userId } = req.params;

  try {
    const agentData = await AgentData.findOne({ userId });

    if (!agentData) {
      return res.status(404).json({
        success: false,
        message: 'Agent credentials not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: agentData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getPlayerRecords = async (req, res) => {
  try {
    const userId = req.user._id;

    // Pagination setup
    const page = parseInt(req.query.page) || 1; // Current page number, default to 1
    const limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    // Fetch the total count of player records for the user
    const total = await Player.countDocuments({ userId });

    // Fetch players with pagination
    const players = await Player.find({ userId }).skip(skip).limit(limit);

    if (!players || players.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No players found for this user',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Player records fetched successfully',
      count: players.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: players,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



module.exports = {
  getAgentCredentials,
  addAgentCredentials,
  getPlayerRecords
};
