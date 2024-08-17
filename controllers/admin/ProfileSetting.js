const AdminSettings = require('../../models/AdminSettings');
const errorHandler = require('../../middleware/errorHandler');

// Get admin settings
const getAdminSettings = async (req, res, next) => {
  try {
    const adminSettings = await AdminSettings.findOne().populate('createdBy', 'name email');
    if (!adminSettings) {
      return res.status(404).json({
        success: false,
        message: 'Admin settings not found',
      });
    }
    res.status(200).json({
      success: true,
      data: adminSettings,
    });
  } catch (error) {
    errorHandler(error, req, res, next);
  }
};

// Update admin settings
const updateAdminSettings = async (req, res, next) => {
  try {
    const {
      minBet, maxBet, minWinningPerBet, maxWinningPerBet, adminUpiId,
      enableGlobalResult, globalProfitPercentage, howToPlay, fairGameData
    } = req.body;

    const adminSettings = await AdminSettings.findOne();
    if (!adminSettings) {
      return res.status(404).json({
        success: false,
        message: 'Admin settings not found',
      });
    }

    // Ensure only admins can update settings
    const user = req.user;
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
      });
    }

    // Update the settings
    adminSettings.minBet = minBet;
    adminSettings.maxBet = maxBet;
    adminSettings.minWinningPerBet = minWinningPerBet;
    adminSettings.maxWinningPerBet = maxWinningPerBet;
    adminSettings.adminUpiId = adminUpiId;
    adminSettings.enableGlobalResult = enableGlobalResult;
    adminSettings.globalProfitPercentage = globalProfitPercentage;
    adminSettings.howToPlay = howToPlay;
    adminSettings.fairGameData = fairGameData;
    adminSettings.createdBy = user._id; // Set the user who updated the settings

    await adminSettings.save();

    res.status(200).json({
      success: true,
      message: 'Admin settings updated successfully',
      data: adminSettings,
    });
  } catch (error) {
    errorHandler(error, req, res, next);
  }
};

module.exports = {
  getAdminSettings,
  updateAdminSettings,
};
