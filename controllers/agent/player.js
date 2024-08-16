const AgentData = require('../../models/AgentData');
const User = require('../../models/User');

// API to add credentials for an agent
const addAgentCredentials = async (req, res) => {
    const { fetch_balance_api, update_balance_api, secretTokenFromAgent, userId } = req.body; // Extract userId from body
  
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }
  
    try {
      // Check if the agent already has data
      let agentData = await AgentData.findOne({ userId });
  
      if (!agentData) {
        // If no agent data exists, create a new one
        agentData = new AgentData({
          userId,
          fetch_balance_api,
          update_balance_api,
          secretTokenFromAgent,
        });
      } else {
        // Update existing agent data
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
  
// API to retrieve agent credentials for admin use
const getAgentCredentials = async (req, res) => {
  const { userId } = req.params; // The ID of the agent whose credentials are needed

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


module.exports = {
    getAgentCredentials,
    addAgentCredentials
};
