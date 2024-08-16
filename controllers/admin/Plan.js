const Plan = require('../../models/Plan');
const asyncHandler = require('express-async-handler');

// Create a new plan
const createPlan = asyncHandler(async (req, res) => {
	const plan = new Plan(req.body);
	await plan.save();
	res.status(201).json({
		success: true,
		message: 'Plan created successfully',
		data: plan,
	});
});

// Get all plans
const getAllPlans = asyncHandler(async (req, res) => {
	const page = parseInt(req.query.page) || 1; // Current page number, default to 1
	const limit = parseInt(req.query.limit) || 10; // Number of records per page, default to 10
	const skip = (page - 1) * limit; // Calculate the number of documents to skip
  
	// Fetch the total count of documents
	const total = await Plan.countDocuments();
  
	// Fetch the plans with pagination
	const plans = await Plan.find().skip(skip).limit(limit);
  
	res.status(200).json({
	  success: true,
	  message: 'Get all plans',
	  count: plans.length,
	  total,
	  totalPages: Math.ceil(total / limit),
	  currentPage: page,
	  data: plans,
	});
  });

  
const getAllAgentsNoPagination = async (req, res) => {
	try {
		const plans = await Plan.find();
		res.json(plans);
	} catch (error) {
		res.status(500).json({ message: "Error fetching plans", error });
	}
};

// Get a single plan by ID
const getPlanById = asyncHandler(async (req, res) => {
	const plan = await Plan.findById(req.params.planId);
	if (!plan) {
		return res.status(404).json({ success: false, message: 'Plan not found' });
	}
	res.status(200).json({
		success: true,
		message: 'Get single plan',
		data: plan,
	});
});

// Update a plan by ID
const updatePlan = asyncHandler(async (req, res) => {
	const plan = await Plan.findById(req.params.planId);
	if (!plan) {
		return res.status(404).json({
			success: false,
			message: 'Plan not found',
		});
	}
	Object.assign(plan, req.body);
	await plan.save();
	res.status(200).json({
		success: true,
		message: 'Plan updated successfully',
		data: plan,
	});
});

// Delete a plan by ID
const deletePlan = asyncHandler(async (req, res) => {
	const plan = await Plan.findById(req.params.planId);
	if (!plan) {
		return res.status(404).json({ success: false, message: 'Plan not found' });
	}
	await plan.deleteOne();
	res.status(200).json({
		success: true,
		message: 'Plan deleted successfully',
	});
});

module.exports = {
	createPlan,
	getAllPlans,
	getAllAgentsNoPagination,
	getPlanById,
	updatePlan,
	deletePlan,
};
