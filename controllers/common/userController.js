const User = require('../../models/User');
const asyncHandler = require('express-async-handler');

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if the user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create the user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      blocked: user.blocked,
      createdAt: user.createdAt,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user; // We already have the user data from the auth middleware

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    token: req.token, // Return the same token
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

module.exports = {
  createUser,
  getUserProfile
};
