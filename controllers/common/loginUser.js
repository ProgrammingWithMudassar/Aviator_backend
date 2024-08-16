const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find the user by email
		const user = await User.findOne({ email });

		// Check if the user exists
		if (!user) {
			return res.status(400).json({
				success: false,
				message: 'Invalid credentials',
			});
		}

		// Check if the user is blocked
		if (user.blocked) {
			return res.status(403).json({
				success: false,
				message: 'You are blocked by the admin',
			});
		}

		// Check if the password matches
		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res
				.status(400)
				.json({ success: false, message: 'Invalid credentials' });
		}

		// Generate JWT token
		const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
			expiresIn: '7d',
		});

		// Send success response with token and user info
		res.status(200).json({ success: true, token, user });
	} catch (err) {
		// Handle any unexpected errors
		res.status(500).json({ success: false, message: err.message });
	}
};

module.exports = {
	loginUser,
};
