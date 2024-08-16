const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

// Login User
const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({
			success: false,
			message: 'Email and password are required',
		});
	}

	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		return res.status(401).json({
			success: false,
			message: 'Invalid credentials',
		});
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		return res.status(401).json({
			success: false,
			message: 'Invalid credentials',
		});
	}

	// Sign the JWT
	const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
		expiresIn: '15m', // Short-lived access token
	});

	// Create a refresh token and save it in the database or send it as a cookie
	const refreshToken = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET, {
		expiresIn: '7d', // Longer-lived refresh token
	});

	// Set httpOnly cookie for refresh token
	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		path: '/api/auth/refresh-token', // Refresh endpoint
	});

	// Exclude password from the response
	user.password = undefined;

	res.status(200).json({
		success: true,
		token,
		user,
	});
});

module.exports = {
	loginUser,
};
