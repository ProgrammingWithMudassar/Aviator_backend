const express = require('express');
const { loginUser } = require('../controllers/common/loginUser');
const { logoutUser } = require('../controllers/common/logout');
// const { protect } = require('../middleware/authMiddleware');
const { addFirstAdminUser } = require('../controllers/common/addFirstAdminUser');
const { createUser } = require('../controllers/common/userController');
const { auth } = require('../middleware/authMiddleware')


const router = express.Router();

// Login Route
router.post('/login', loginUser);

// Logout Route
router.post('/logout', auth, logoutUser);

router.post('/add-first-admin', addFirstAdminUser);

router.post('/users', createUser);

module.exports = router;
