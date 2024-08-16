// controllers/gameController.js

const Game = require('../models/Game');

// Function to generate unique game IDs
const generateGameId = () => {
  return Math.random().toString(36).substring(2, 15); // Simple random string generator
};

// Combined API for generating game IDs and saving crash points
const handleGameManagement = async (req, res) => {
  try {
    // If crash points are sent in the request, save them
    if (req.body.games && req.body.games.length > 0) {
      const { games } = req.body;

      for (const game of games) {
        await Game.create({
          gameId: game.gameId,
          crashAt: game.crashAt,
          status: 'completed',
        });
      }
    }

    // Generate the next set of game IDs
    const nextGames = [];
    for (let i = 0; i < 5; i++) {
      const gameId = generateGameId();
      nextGames.push({ gameId, crashAt: [], status: 'pending' });
    }

    res.status(200).json({ success: true, nextGames });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error handling game management' });
  }
};

module.exports = { handleGameManagement };
