const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const adminExists = await User.findOne({ email, role: 'admin' });

  if (adminExists) {
    res.status(400);
    throw new Error('Admin user already exists');
  }

  const adminUser = await User.create({
    name,
    email,
    password,
    role: 'admin',
  });

  if (adminUser) {
    res.status(201).json({
      _id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      createdAt: adminUser.createdAt,
    });
  } else {
    res.status(400);
    throw new Error('Invalid admin user data');
  }
});

module.exports = {
  createAdminUser,
};
