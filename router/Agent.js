const express = require('express');
const { addAgentCredentials } = require('../controllers/agent/player');
const { getUserWithPlan, requestBalance } = require('../controllers/agent/Balance');
const { 
    getAgentProfile,
    updateAgentProfile,
    getAgentCurrentPlan,
    changePassword
 } = require("../controllers/agent/Profile");
const { auth, roleAuth } = require('../middleware/authMiddleware');
const { getBalanceHistory } = require('../controllers/agent/History');

const router = express.Router();

router.post('/add-credentials', auth, addAgentCredentials);

router.get('/balance-plan-info', auth, getUserWithPlan);
router.post('/request-balance', auth, requestBalance);
router.get('/balance-history', auth, getBalanceHistory);
router.get('/profile', auth, getAgentProfile); 
router.put('/profile', auth, updateAgentProfile); 

router.get('/current-plan', auth, getAgentCurrentPlan);

// Change password route
router.post('/change-password', auth, changePassword);

module.exports = router;
