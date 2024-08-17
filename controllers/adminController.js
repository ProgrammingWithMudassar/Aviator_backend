const User = require('../models/User');
const AdminSettings = require('../models/AdminSettings');
const asyncHandler = require('express-async-handler');

// Create Admin User and associated AdminSettings
const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if the admin already exists
  const adminExists = await User.findOne({ email, role: 'admin' });

  if (adminExists) {
    res.status(400);
    throw new Error('Admin user already exists');
  }

  // Create a new admin user
  const adminUser = await User.create({
    name,
    email,
    password,
    role: 'admin',
  });

  if (adminUser) {
    const defaultAdminSettings = await AdminSettings.create({
      minBet: null,
      maxBet: null,
      minWinningPerBet: null,
      maxWinningPerBet: null,
      adminUpiId: '',
      enableGlobalResult: false,
      globalProfitPercentage: null,
      howToPlay: '',
      fairGameData: '',
      createdBy: adminUser._id,  
    });

    res.status(201).json({
      user: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        createdAt: adminUser.createdAt,
      },
      settings: defaultAdminSettings, // Return the settings along with the admin data
    });
  } else {
    res.status(400);
    throw new Error('Invalid admin user data');
  }
});

module.exports = {
  createAdminUser,
};
