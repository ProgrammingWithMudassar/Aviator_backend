const Player = require('../../models/Player');
const asyncHandler = require('express-async-handler');


const getAllPlayers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page number, default to 1
  const limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
  const skip = (page - 1) * limit; // Calculate the number of documents to skip
  
  // Fetch the total count of players
  const total = await Player.countDocuments();
  
  // Fetch the players with pagination and populate 'userId' and 'agentId' fields
  const players = await Player.find().skip(skip).limit(limit).populate('userId', 'name').populate('agentId', 'name');
  
  // Respond with the paginated data
  res.status(200).json({
    success: true,
    message: 'Players retrieved successfully',
    count: players.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: players,
  });
});


module.exports = {
  getAllPlayers
};
