const Player = require('../../models/Player');

const getAllPlayers = async (req, res) => {
  try {
    // Find all players in the database
    const players = await Player.find().populate('userId', 'name').populate('agentId', 'name');

    return res.status(200).json({
      success: true,
      message: 'Players retrieved successfully',
      data: players
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve players',
      error: err.message
    });
  }
};

module.exports = {
  getAllPlayers
};
