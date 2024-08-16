const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({
				success: false,
				message: 'Invalid credentials',
			});
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res
				.status(400)
				.json({ success: false, message: 'Invalid credentials' });
		}

		const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
			expiresIn: '7d',
		});

		res.status(200).json({ success: true, token, user });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

module.exports = {
	loginUser,
};
