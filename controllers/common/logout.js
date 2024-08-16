// controllers/common/logoutController.js

const asyncHandler = require('express-async-handler');

const logoutUser = asyncHandler(async (req, res) => {
  // Check if the user is authenticated via the authMiddleware
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no user found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = {
  logoutUser,
};
