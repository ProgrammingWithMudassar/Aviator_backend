const express = require('express');
const { addAgentCredentials } = require('../controllers/agent/player');
const { getUserWithPlan, requestBalance } = require('../controllers/agent/Balance');
const { changePassword } = require("../controllers/agent/Profile")
const { auth, roleAuth } = require('../middleware/authMiddleware');
const { getBalanceHistory } = require('../controllers/agent/History');


const router = express.Router();

// Route for agent to add or update credentials
router.post('/add-credentials', addAgentCredentials);
router.get('/balance-plan-info', auth, getUserWithPlan);

router.post('/change-password', auth, changePassword)

router.post('/request-balance', auth, requestBalance);
router.get('/balance-history', auth, getBalanceHistory); 


module.exports = router;
