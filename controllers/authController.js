/**
 * Authentication Controller
 * =======================
 * Handles all authentication-related business logic including:
 * - User registration
 * - Login/Logout
 * - Password management
 * - CP number management
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/config");
const passwordUtils = require("../utils/passwordUtils");

const authController = {
	/**
	 * User Registration
	 * ================
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async register(req, res) {
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

			// Check if email already exists
			const [existingUsers] = await pool.execute(
				"SELECT id FROM users WHERE email = ?",
				[email]
			);

			if (existingUsers.length > 0) {
				return res.status(409).json({
					success: false,
					error: "Email already registered",
				});
			}

			// Hash password
			const hashedPassword = await passwordUtils.hashPassword(password);

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

			// Log registration in development
			if (process.env.NODE_ENV === "development") {
				console.log("New user registered:", {
					userId: result.insertId,
					email: email,
				});
			}

			res.status(201).json({
				success: true,
				message:
					"Registration successful. Account pending CP number assignment.",
				userId: result.insertId,
			});
		} catch (error) {
			console.error("Registration error:", error);
			res.status(500).json({
				success: false,
				error: "Registration failed",
				details:
					process.env.NODE_ENV === "development" ? error.message : undefined,
			});
		}
	},

	/**
	 * User Login
	 * ==========
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async login(req, res) {
		try {
			const { email, cpNumber, password } = req.body;

			// Find user with active CP number
			const [users] = await pool.execute(
				`SELECT * FROM users 
                WHERE email = ? 
                AND cp_number = ?
                AND cp_status = 'ACTIVE'
                LIMIT 1`,
				[email, cpNumber]
			);

			if (users.length === 0) {
				return res.status(401).json({
					success: false,
					error: "Invalid credentials or inactive CP number",
				});
			}

			const user = users[0];

			// Verify password
			const isValidPassword = await passwordUtils.verifyPassword(
				password,
				user.password
			);
			if (!isValidPassword) {
				return res.status(401).json({
					success: false,
					error: "Invalid credentials",
				});
			}

			// Generate JWT token
			const token = jwt.sign(
				{
					id: user.id,
					email: user.email,
					cpNumber: user.cp_number,
					cpStatus: user.cp_status,
				},
				process.env.JWT_SECRET,
				{
					expiresIn: process.env.NODE_ENV === "development" ? "24h" : "1h",
				}
			);

			// Set token in cookie
			res.cookie("authToken", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: process.env.NODE_ENV === "development" ? 86400000 : 3600000, // 24h in dev, 1h in prod
			});

			// Log login in development
			if (process.env.NODE_ENV === "development") {
				console.log("User logged in:", {
					userId: user.id,
					email: user.email,
					cpNumber: user.cp_number,
				});
			}

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
	},

	/**
	 * User Logout
	 * ===========
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async logout(req, res) {
		try {
			// Clear auth token cookie
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
	},

	/**
	 * CP Number Assignment
	 * ===================
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async assignCPNumber(req, res) {
		try {
			const { userId, cpNumber } = req.body;

			// Check if CP number is already assigned
			const [existingCP] = await pool.execute(
				"SELECT id FROM users WHERE cp_number = ?",
				[cpNumber]
			);

			if (existingCP.length > 0) {
				return res.status(409).json({
					success: false,
					error: "CP number already assigned to another user",
				});
			}

			// Update user with CP number
			const [result] = await pool.execute(
				`UPDATE users 
                SET cp_number = ?,
                    cp_status = 'ACTIVE',
                    account_status = 'ACTIVE',
                    cp_issued_date = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
				[cpNumber, userId]
			);

			if (result.affectedRows === 0) {
				return res.status(404).json({
					success: false,
					error: "User not found",
				});
			}

			// Log CP number assignment in development
			if (process.env.NODE_ENV === "development") {
				console.log("CP number assigned:", {
					userId: userId,
					cpNumber: cpNumber,
				});
			}

			res.json({
				success: true,
				message: "CP number assigned successfully",
			});
		} catch (error) {
			console.error("CP number assignment error:", error);
			res.status(500).json({
				success: false,
				error: "Failed to assign CP number",
				details:
					process.env.NODE_ENV === "development" ? error.message : undefined,
			});
		}
	},

	/**
	 * Get User Profile
	 * ===============
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async getProfile(req, res) {
		try {
			const [users] = await pool.execute(
				`SELECT id, first_name, surname, email, phone, 
                        residential_address, cp_number, cp_status,
                        account_status, created_at
                FROM users WHERE id = ?`,
				[req.user.id]
			);

			if (users.length === 0) {
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
				details:
					process.env.NODE_ENV === "development" ? error.message : undefined,
			});
		}
	},

	/**
	 * Update User Profile
	 * ==================
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	async updateProfile(req, res) {
		try {
			const { phone, residentialAddress } = req.body;

			const [result] = await pool.execute(
				`UPDATE users 
                SET phone = ?,
                    residential_address = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
				[phone, residentialAddress, req.user.id]
			);

			if (result.affectedRows === 0) {
				return res.status(404).json({
					success: false,
					error: "User not found",
				});
			}

			res.json({
				success: true,
				message: "Profile updated successfully",
			});
		} catch (error) {
			console.error("Profile update error:", error);
			res.status(500).json({
				success: false,
				error: "Failed to update profile",
				details:
					process.env.NODE_ENV === "development" ? error.message : undefined,
			});
		}
	},
};

module.exports = authController;
