/**
 * Authentication Routes
 * ===================
 * Handles all authentication-related routes including:
 * - User registration
 * - Login/Logout
 * - Profile management
 * - CP number verification
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const validation = require("../middleware/validation");
const pool = require("../db/config");

/**
 * User Registration
 * ================
 * POST /api/auth/register
 *
 * Registers a new user with pending CP number status
 * Required fields:
 * - idNumber (13 digits SA ID)
 * - firstName
 * - surname
 * - email
 * - phone
 * - residentialAddress
 * - password
 */
router.post(
	"/register",
	validation.sanitizeBody,
	validation.registerValidation,
	validation.validate,
	async (req, res) => {
		try {
			const {
				idNumber,
				firstName,
				surname,
				email,
				phone,
				residentialAddress,
				password,
			} = req.body;

			// Hash password
			const hashedPassword = await bcrypt.hash(password, 10);

			// Insert new user
			const [result] = await pool.execute(
				`INSERT INTO users (
                    id_number,
                    first_name,
                    surname,
                    email,
                    phone,
                    residential_address,
                    password,
                    account_status,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', CURRENT_TIMESTAMP)`,
				[
					idNumber,
					firstName,
					surname,
					email,
					phone,
					residentialAddress,
					hashedPassword,
				]
			);

			res.status(201).json({
				success: true,
				message:
					"Registration successful. Account pending CP number assignment.",
				userId: result.insertId,
			});
		} catch (error) {
			console.error("Registration error:", error);

			// Handle duplicate entry errors
			if (error.code === "ER_DUP_ENTRY") {
				if (error.message.includes("email")) {
					return res.status(409).json({
						success: false,
						error: "Email already registered",
					});
				}
				if (error.message.includes("id_number")) {
					return res.status(409).json({
						success: false,
						error: "ID number already registered",
					});
				}
			}

			res.status(500).json({
				success: false,
				error: "Registration failed",
				details:
					process.env.NODE_ENV === "development" ? error.message : undefined,
			});
		}
	}
);

/**
 * User Login
 * ==========
 * POST /api/auth/login
 *
 * Authenticates user with email, CP number, and password
 * Required fields:
 * - email
 * - cpNumber
 * - password
 */
router.post(
	"/login",
	auth.checkFailedAttempts,
	validation.sanitizeBody,
	validation.loginValidation,
	validation.validate,
	async (req, res) => {
		try {
			const { email, cpNumber, password } = req.body;

			// Find user
			const [users] = await pool.execute(
				`SELECT * FROM users 
                WHERE email = ? 
                AND cp_number = ? 
                AND cp_status = 'ACTIVE' 
                LIMIT 1`,
				[email, cpNumber]
			);

			const user = users[0];

			// Check if user exists and CP number is active
			if (!user) {
				auth.trackFailedAttempt(req);
				return res.status(401).json({
					success: false,
					error: "Invalid credentials or inactive CP number",
				});
			}

			// Verify password
			const isValidPassword = await bcrypt.compare(password, user.password);
			if (!isValidPassword) {
				auth.trackFailedAttempt(req);
				return res.status(401).json({
					success: false,
					error: "Invalid credentials",
				});
			}

			// Reset failed attempts on successful login
			auth.resetFailedAttempts(req);

			// Generate token
			const token = jwt.sign(
				{
					id: user.id,
					email: user.email,
					cpNumber: user.cp_number,
					cpStatus: user.cp_status,
				},
				process.env.JWT_SECRET,
				{ expiresIn: "1h" }
			);

			// Set token in cookie
			res.cookie("authToken", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 3600000, // 1 hour
			});

			res.json({
				success: true,
				user: {
					id: user.id,
					email: user.email,
					firstName: user.first_name,
					surname: user.surname,
					cpNumber: user.cp_number,
					cpStatus: user.cp_status,
				},
			});
		} catch (error) {
			console.error("Login error:", error);
			res.status(500).json({
				success: false,
				error: "Login failed",
				details:
					process.env.NODE_ENV === "development" ? error.message : undefined,
			});
		}
	}
);

/**
 * User Logout
 * ===========
 * POST /api/auth/logout
 *
 * Logs out user by clearing auth token
 * Requires authentication
 */
router.post("/logout", auth.isAuthenticated, (req, res) => {
	try {
		res.clearCookie("authToken", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		});

		res.json({
			success: true,
			message: "Logged out successfully",
		});
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({
			success: false,
			error: "Logout failed",
		});
	}
});

/**
 * Get User Profile
 * ===============
 * GET /api/auth/profile
 *
 * Retrieves user profile information
 * Requires authentication
 */
router.get("/profile", auth.isAuthenticated, async (req, res) => {
	try {
		const [users] = await pool.execute(
			"SELECT id, first_name, surname, email, phone, residential_address, cp_number, cp_status FROM users WHERE id = ?",
			[req.user.id]
		);

		if (!users[0]) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		res.json({
			success: true,
			profile: users[0],
		});
	} catch (error) {
		console.error("Profile retrieval error:", error);
		res.status(500).json({
			success: false,
			error: "Failed to retrieve profile",
		});
	}
});

/**
 * Update User Profile
 * ==================
 * PUT /api/auth/profile
 *
 * Updates user profile information
 * Requires authentication
 */
router.put(
	"/profile",
	auth.isAuthenticated,
	validation.sanitizeBody,
	// Add profile update validation here
	async (req, res) => {
		try {
			const { phone, residentialAddress } = req.body;

			await pool.execute(
				`UPDATE users 
                SET phone = ?, 
                    residential_address = ?,
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?`,
				[phone, residentialAddress, req.user.id]
			);

			res.json({
				success: true,
				message: "Profile updated successfully",
			});
		} catch (error) {
			console.error("Profile update error:", error);
			res.status(500).json({
				success: false,
				error: "Failed to update profile",
			});
		}
	}
);

/**
 * Member Content Access
 * ====================
 * GET /api/auth/member-content
 *
 * Retrieves member-only content
 * Requires authentication and active CP number
 */
router.get(
	"/member-content",
	auth.isAuthenticated,
	auth.hasActiveCPNumber,
	async (req, res) => {
		try {
			// Add member content retrieval logic here
			res.json({
				success: true,
				message: "Access granted to member content",
				// Add member content data here
			});
		} catch (error) {
			console.error("Member content error:", error);
			res.status(500).json({
				success: false,
				error: "Failed to retrieve member content",
			});
		}
	}
);

module.exports = router;
