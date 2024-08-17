const Game = require('../../models/Game');
const AgentData = require('../../models/AgentData');
const GameBet = require('../../models/GameBet');
const { generateRandomAlphaString } = require('../../utils/randomString');

// Utility functions for algorithms
const generateCrashAt = (algorithm, previousGames = [], totalDailyProfit = 0) => {
  switch (algorithm) {
    case 'egp':
      return calculateEGPCrashAt(totalDailyProfit);
    case 'dpp':
      return calculateDPPCrashAt(previousGames, totalDailyProfit);
    case 'npa':
      return calculateNPACrashAt(previousGames);
    case 'random':
    default:
      return generateRandomCrashAt();
  }
};

const calculateEGPCrashAt = (totalDailyProfit) => {
  return totalDailyProfit > 0 ? (Math.random() * 5 + 1) : (Math.random() * 2 + 1);
};

const calculateDPPCrashAt = (previousGames, totalDailyProfit) => {
  return totalDailyProfit > 0 ? (Math.random() * 4 + 1) : (Math.random() * 3 + 1);
};

const calculateNPACrashAt = (previousGames) => {
  const ratioDistribution = [0, 0, 0, 5, 10, 10, 15, 50, 100, 150];
  return ratioDistribution[Math.floor(Math.random() * ratioDistribution.length)];
};

const generateRandomCrashAt = () => {
  return Math.random() * 100 + 1;
};

const calculateTotalDailyProfit = (previousGames) => {
  let profit = 0;
  previousGames.forEach(game => {
    const bets = game.bets;
    const totalBetAmount = bets.reduce((total, bet) => total + bet.amount, 0);
    const totalWinAmount = bets.reduce((total, bet) => total + (bet.status === 'win' ? bet.winAmount : 0), 0);
    profit += totalBetAmount - totalWinAmount;
  });
  return profit;
};

// Controller to start a new game for an agent
const startNewGame = async (req, res) => {
  try {
    const { agentId } = req.body;

    // Find the agent
    const agent = await AgentData.findById(agentId);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    // Get previous games and calculate total daily profit
    const previousGames = await Game.find({ agentId }).sort({ createdAt: -1 }).limit(10);
    const totalDailyProfit = calculateTotalDailyProfit(previousGames);

    // Generate crashAt based on agent's selected algorithm
    const crashAt = generateCrashAt(agent.selectedAlgorithm, previousGames, totalDailyProfit);

    // Create a new game
    const newGame = await Game.create({
      gameId: generateRandomAlphaString(10),
      agentId: agent._id,
      crashAt,
      status: 'pending'
    });

    return res.status(201).json({ success: true, message: 'New game started', game: newGame });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Controller to get live game data for an agent
const getLiveGameData = async (req, res) => {
  try {
    const { agentId } = req.query;

    // Find the latest game for the agent
    const currentGame = await Game.findOne({ agentId, status: 'pending' });
    if (!currentGame) {
      return res.status(404).json({ success: false, message: 'No active game found' });
    }

    // Retrieve the live bet data for the current game
    const liveBetData = await GameBet.find({ gameId: currentGame._id }).populate('userId', 'name');
    
    const totalBetAmount = liveBetData.reduce((total, bet) => total + bet.amount, 0);
    const players = liveBetData.map(bet => ({
      name: bet.userId.name,
      betAmount: bet.amount,
      claimedAmount: bet.winAmount,
    }));

    return res.status(200).json({
      success: true,
      gameId: currentGame.gameId,
      crashAt: currentGame.crashAt,
      status: currentGame.status,
      totalBetAmount,
      players,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

// Controller to get game history with pagination
const getGameHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch the total count of games
    const totalGames = await Game.countDocuments();

    // Fetch games with pagination
    const games = await Game.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Fetch the bets for each game
    const gameHistory = await Promise.all(
      games.map(async (game) => {
        const bets = await GameBet.find({ gameId: game._id }).populate('userId', 'name');
        const totalBetAmount = bets.reduce((total, bet) => total + bet.amount, 0);
        const totalWinAmount = bets.reduce((total, bet) => total + (bet.status === 'win' ? bet.winAmount : 0), 0);
        const totalLossAmount = bets.reduce((total, bet) => total + (bet.status === 'loss' ? bet.amount : 0), 0);

        return {
          gameId: game.gameId,
          crashAt: game.crashAt,
          status: game.status,
          totalBetAmount,
          totalWinAmount,
          totalLossAmount,
          players: bets.map(bet => ({
            name: bet.userId.name,
            betAmount: bet.amount,
            claimedAmount: bet.winAmount
          }))
        };
      })
    );

    return res.status(200).json({
      success: true,
      totalGames,
      totalPages: Math.ceil(totalGames / limit),
      currentPage: page,
      games: gameHistory
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  }
};

module.exports = {
  startNewGame,
  getLiveGameData,
  getGameHistory
};
