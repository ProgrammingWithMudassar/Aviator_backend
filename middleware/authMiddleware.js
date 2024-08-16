const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
	try {
		const authHeader = req.header('Authorization');

		if (!authHeader) {
			return res.status(401).json({
				success: false,
				message: 'Authorization header is missing',
			});
		}
		const token = authHeader.replace('Bearer ', '');
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findOne({ _id: decoded._id });

		if (!user) {
			throw new Error();
		}

		req.token = token;
		req.user = user;
		next();
	} catch (err) {
		return res.status(401).json({
			success: false,
			message: 'Please authenticate.',
		});
	}
};


const roleAuth = roles => (req, res, next) => {
	if (roles.includes(req.user.role)) {
		return next();
	}
	res.status(403).json({ success: false, message: 'Access denied.' });
};
module.exports = {
	auth,
	roleAuth
};
