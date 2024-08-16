const { MongooseError } = require('mongoose');

function toSentenceCase(str) {
	if (!str) {
		return '';
	}
	str = str.trim();
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function errorHandler(err, req, res, next) {
	const errorResponse = {
		message: 'An error occurred. Please try again later.',
		status: 500, // Internal Server Error
	};

	switch (err.code) {
		case 11000:
			errorResponse.message = `${Object.keys(err.keyValue)
				.map(key => `${toSentenceCase(key)} "${err.keyValue[key]}"`)
				.join(', ')} already exists.`;
			errorResponse.status = 409;
			break;
		case 121:
			errorResponse.message =
				'Document validation failed. Please ensure all fields meet the required criteria.';
			errorResponse.status = 400;
			break;
		default:
			errorResponse.message = `MongoDB Error: ${err.message}`;
			errorResponse.status = 500;
			break;
	}
	if (err.name === 'ValidationError') {
		errorResponse.message = err.message;
		errorResponse.status = 400;
	} else if (err.name === 'CastError') {
		errorResponse.message = `Invalid value for field: ${err.path}. Expected type ${err.kind}.`;
		errorResponse.status = 400;
	} else if (err.name === 'UnauthorizedError') {
		errorResponse.message = 'Unauthorized access. Please log in.';
		errorResponse.status = 401; // Unauthorized
	}

	// Send the response
	res.status(errorResponse.status).json({
		success: false,
		message: errorResponse.message,
	});
}

module.exports = errorHandler;
