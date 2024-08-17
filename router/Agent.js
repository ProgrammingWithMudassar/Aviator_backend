const express = require('express');
const {
    getAgentCredentials,
    addAgentCredentials,
    getPlayerRecords
} = require('../controllers/agent/player');
const { getUserWithPlan, requestBalance, updatePlan } = require('../controllers/agent/Balance');
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
router.get('/get-player-records', auth, getPlayerRecords)

router.post('/update-plan', auth, updatePlan);


module.exports = router;
