// routes/planRoutes.js

const express = require('express');
const { auth, roleAuth } = require('../middleware/authMiddleware'); 
const { createAdminUser } = require('../controllers/adminController');
const {
	createPlan,
	getAllPlans,
	getAllAgentsNoPagination,
	getPlanById,
	updatePlan,
	deletePlan,
} = require('../controllers/admin/Plan');
const {
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
} = require('../controllers/admin/Agent');
const	{
	getDashboardStats
} = require("../controllers/admin/dashboard")
const {
	approveBalanceRequest,
	rejectBalanceRequest,
} = require('../controllers/admin/Approvals');
const {
	getAllPlayers
} = require('../controllers/admin/player')
const {
	getAdminSettings,
	updateAdminSettings	
} = require('../controllers/admin/ProfileSetting')




const router = express.Router();

// Create an admin user
router.post('/create-admin', createAdminUser); 

// Admin Management
router.get('/dashboard', getDashboardStats);

router.post('/agent/', createAgent); // Create a new agent
router.get('/agent/', getAllAgents); // Get all agents
router.get('/agent/:agentId', getAgentById); // Get a single agent by ID
router.put('/agent/:agentId', updateAgent); // Update an agent by ID
router.delete('/agent/:agentId', deleteAgent); // Delete an agent by ID
router.post('/agent/:agentId/block', blockAgent); // Block an agent
router.post('/agent/:agentId/unblock', unblockAgent); // Unblock an agent
router.post('/agent/:agentId/renew-plan', renewAgentPlan); // Renew an agent's plan
router.get('/agent/:agentId/win-loss', getAgentWinLoss); // Get an agent's win/loss statistics
router.get('/agent/:agentId/players', getAgentPlayers); // Get players associated with an agent

router.post('/agent/fetch-player', auth, fetchPlayerData);
router.post('/agent/update-player', updatePlayerData);

router.post('/plans/create-plan', createPlan);
router.get('/plans/get-all-plans', getAllPlans);
router.get('/get-all-plans', getAllAgentsNoPagination);
router.get('/plans/:planId', getPlanById);
router.put('/plans/:planId', updatePlan);
router.delete('/plans/:planId', deletePlan);


// Approvals 
router.post('/approve-balance/:requestId', approveBalanceRequest); 
router.post('/reject-balance/:requestId',  rejectBalanceRequest); 


// Get admin settings (for display on frontend)
router.get('/settings', auth, roleAuth(['admin']), getAdminSettings);
router.put('/settings', auth, roleAuth(['admin']), updateAdminSettings);



// Route to get all players
router.get('/players', auth, getAllPlayers);


module.exports = router;
