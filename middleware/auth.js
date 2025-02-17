/**
 * Authentication Middleware
 * =======================
 * Handles route protection and authentication verification
 */

const jwt = require("jsonwebtoken");

// Export individual middleware functions instead of an object
exports.isAuthenticated = (req, res, next) => {
	const token =
		req.cookies.authToken || req.headers.authorization?.split(" ")[1];

	if (!token) {
		return res.status(401).json({
			success: false,
			error: "Authentication required",
			details: "No authentication token provided",
		});
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded; // Attach user data to request
		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			error: "Invalid authentication",
			details: "Invalid or expired token",
		});
	}
};

exports.hasActiveCPNumber = (req, res, next) => {
	if (!req.user.cpNumber || req.user.cpStatus !== "ACTIVE") {
		return res.status(403).json({
			success: false,
			error: "Access denied",
			details: "Active CP number required",
		});
	}
	next();
};

exports.checkSession = (req, res, next) => {
	if (!req.session || !req.session.userId) {
		return res.status(401).json({
			success: false,
			error: "Session expired",
			details: "Please log in again",
		});
	}
	next();
};

exports.checkFailedAttempts = (req, res, next) => {
	const attempts = req.session.failedAttempts || 0;
	if (attempts >= 5) {
		// Max 5 attempts
		const waitTime = 15 * 60 * 1000; // 15 minutes
		if (req.session.lockUntil && Date.now() < req.session.lockUntil) {
			return res.status(429).json({
				success: false,
				error: "Too many attempts",
				details: `Please try again after ${Math.ceil(
					(req.session.lockUntil - Date.now()) / 1000 / 60
				)} minutes`,
			});
		}
		// Reset after lockout period
		req.session.failedAttempts = 0;
		req.session.lockUntil = null;
	}
	next();
};

exports.trackFailedAttempt = (req) => {
	req.session.failedAttempts = (req.session.failedAttempts || 0) + 1;
	if (req.session.failedAttempts >= 5) {
		req.session.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
	}
};

exports.resetFailedAttempts = (req) => {
	req.session.failedAttempts = 0;
	req.session.lockUntil = null;
};
