const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Plan = require('../../models/Plan')
const AgentData = require('../../models/AgentData');
const BalanceRequest = require("../../models/BalanceRequest")

// API to fetch user data with attached plan
const getUserWithPlan = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const objectId = new mongoose.Types.ObjectId(userId);

    const result = await User.aggregate([
      // Match the authenticated user
      {
        $match: {
          _id: objectId
        }
      },
      // Join with AgentData collection
      {
        $lookup: {
          from: 'agentdatas',
          localField: '_id',
          foreignField: 'userId',
          as: 'agentData'
        }
      },
      // Unwind the joined data from AgentData (if exists)
      {
        $unwind: {
          path: '$agentData',
          preserveNullAndEmptyArrays: true
        }
      },
      // Join with Plan collection based on the planId in AgentData
      {
        $lookup: {
          from: 'plans',
          localField: 'agentData.planId',
          foreignField: '_id',
          as: 'planData'
        }
      },
      // Unwind the joined data from Plan (if exists)
      {
        $unwind: {
          path: '$planData',
          preserveNullAndEmptyArrays: true
        }
      },
      // Project the complete user data and the attached plan
    ]);

    // Check if the result is available
    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: 'User or plan data not found' });
    }

    // Send the response with user and complete plan data
    res.status(200).json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error fetching user and plan data: ${error.message}`
    });
  }
});

const requestBalance = asyncHandler(async (req, res) => {
  // Log request body to ensure it's correct
  console.log("Received request body:", req.body);

  const requestBalance = req.body.amountPaid;
  const UPI_Number = req.body.upiId;
  const UTR_Number = req.body.utr;
  const userId = req.user._id;

  console.log("userId:", userId);
  console.log("Amount Paid:", requestBalance);
  console.log("UPI ID:", UPI_Number);
  console.log("UTR:", UTR_Number);

  // Validate required fields
  if (!requestBalance || !UPI_Number || !UTR_Number) {
    return res.status(400).json({
      success: false,
      message: 'All fields (amountPaid, upiId, utr) are required.',
    });
  }

  try {
    // Create balance request
    const balanceRequest = await BalanceRequest.create({
      userId,
      amountPaid: requestBalance,
      upiId: UPI_Number,
      utr: UTR_Number,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Balance request submitted successfully',
      data: balanceRequest,
    });
  } catch (error) {
    console.error("Error creating balance request:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to create balance request',
    });
  }
});

const updatePlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { planId } = req.body;  // Plan ID from the frontend

    // Check if the authenticated user is an agent
    const user = await User.findById(userId);
    if (user.role !== 'agent') {
      return res.status(403).json({ message: 'Only agents can update plans.' });
    }

    console.log("planId", planId);

    const selectedPlan = await Plan.findById(planId);
    console.log("selectedPlan", selectedPlan);
    if (!selectedPlan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }


    // Check if the user has enough balance to buy the plan
    if (user.balance < selectedPlan.price) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    // Find the user's agent data
    const agentData = await AgentData.findOne({ userId });
    if (!agentData) {
      return res.status(404).json({ message: 'Agent data not found.' });
    }

    // Update user's balance and assign the new plan
    user.balance -= selectedPlan.price;
    await user.save();

    // Assign the new plan to the agent and set the plan expiry date
    const currentDate = new Date();
    const expiryDate = new Date(currentDate.setDate(currentDate.getDate() + selectedPlan.days));

    agentData.planId = selectedPlan._id;
    agentData.planExpiryDate = expiryDate;
    await agentData.save();

    return res.status(200).json({ message: 'Plan updated successfully', agentData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while updating the plan.' });
  }
};

module.exports = {
  getUserWithPlan,
  requestBalance,
  updatePlan
};
