const express = require('express');
const { startBettingForAgents, getAllGames, getAgentGameBets } = require('../controllers/Games/startBettingForAgent');
const { auth } = require('../middleware/authMiddleware'); // Assuming you have auth middleware

const router = express.Router();

// Start betting for all agents
router.get('/start-betting-for-agents', startBettingForAgents);

// Get all games (admin view)
router.get('/all-games', getAllGames);

// Get specific agent's game bets
router.get('/agent-game-bets', auth, getAgentGameBets);  // Protected route

module.exports = router;
