const cron = require('node-cron');
const AgentData = require('../../models/AgentData');
const Game = require('../../models/Game');
const { generateCrashAt } = require('../../utils/crashAlgorithms');

// Function to generate bets for all agents
// Function to generate bets for all agents
const generateBetsForAgents = async (io) => {
  try {
    const agents = await AgentData.find(); // Fetch all agents

    for (const agent of agents) {
      let gameIndex = await Game.countDocuments({ userId: agent.userId }) + 1;

      // Generate 5 bets for each agent
      for (let i = 0; i < 5; i++) {
        const crashAt = generateCrashAt(agent.selectedAlgorithm).toFixed(1); // Round to 1 decimal
        const gameId = `${agent.userId}-${gameIndex}`; // Unique game ID based on agent's userId and index

        // Create and save game in DB
        const game = new Game({
          gameId,
          userId: agent.userId, // Storing agent's userId for filtering later
          crashAt,
          status: 'pending',
        });

        await game.save();

        // Emit game data to the frontend via socket for real-time updates
        io.emit('gameUpdate', {
          gameId,
          crashAt: `${crashAt}x`,
          agentId: agent.userId,
        });

        console.log(`Generated game ${gameId} for agent ${agent.userId}`);
        gameIndex++;
      }
    }
  } catch (error) {
    console.error(`Error generating bets: ${error.message}`);
  }
};

// This function is for manual API trigger (optional)
const startBettingForAgents = (req, res) => {
  const io = req.app.get('socketio');

  // Run the betting generation once manually
  generateBetsForAgents(io);

  return res.status(200).json({
    success: true,
    message: 'Betting process started for all agents.',
  });
};

const initializeBettingJob = (io) => {
  // Schedule the cron job to run every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    console.log('Running the betting generation job...');
    generateBetsForAgents(io);
  });
};


// API to get all games (admin or general view)
const getAllGames = async (req, res) => {
  try {
    const games = await Game.find();

    if (!games || games.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No games found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: games,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching games.',
      error: error.message,
    });
  }
};

// API to get specific agent's bets
const getAgentGameBets = async (req, res) => {
  try {
    const agentId = req.user._id; // Assuming the agent's ID is stored in the JWT token

    // Find games associated with this agent's ID
    const agentGames = await Game.find({ userId: agentId });

    if (!agentGames || agentGames.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No games found for this agent',
      });
    }

    return res.status(200).json({
      success: true,
      data: agentGames,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching game bets for agent',
      error: error.message,
    });
  }
};

module.exports = {
  startBettingForAgents,
  getAllGames,  // New API to fetch all games
  getAgentGameBets,
  initializeBettingJob
};
