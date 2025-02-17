/**
 * User Model
 * ==========
 * Handles all database operations related to user management
 * including registration, authentication, and CP number management.
 */

const pool = require("../db/config");

const userModel = {
	/**
	 * Create a new user (Registration)
	 * @param {Object} userData - User registration data
	 * @returns {Promise<Object>} Created user's ID or error
	 */
	async createUser({
		idNumber,
		firstName,
		surname,
		email,
		phone,
		residentialAddress,
		passwordHash,
	}) {
		const sql = `
            INSERT INTO users (
                id_number,
                first_name,
                surname,
                email,
                phone,
                residential_address,
                password,
                account_status,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', CURRENT_TIMESTAMP)
        `;

		try {
			const [result] = await pool.execute(sql, [
				idNumber,
				firstName,
				surname,
				email,
				phone,
				residentialAddress,
				passwordHash,
			]);
			return { success: true, userId: result.insertId };
		} catch (error) {
			if (error.code === "ER_DUP_ENTRY") {
				if (error.message.includes("email")) {
					throw new Error("Email already registered");
				}
				if (error.message.includes("id_number")) {
					throw new Error("ID number already registered");
				}
			}
			throw error;
		}
	},

	/**
	 * Find user by email
	 * @param {string} email - User's email address
	 * @returns {Promise<Object|null>} User object or null if not found
	 */
	async findByEmail(email) {
		const sql = "SELECT * FROM users WHERE email = ? LIMIT 1";
		try {
			const [rows] = await pool.execute(sql, [email]);
			return rows[0] || null;
		} catch (error) {
			throw error;
		}
	},

	/**
	 * Find user by CP number
	 * @param {string} cpNumber - User's CP number
	 * @returns {Promise<Object|null>} User object or null if not found
	 */
	async findByCPNumber(cpNumber) {
		const sql = "SELECT * FROM users WHERE cp_number = ? LIMIT 1";
		try {
			const [rows] = await pool.execute(sql, [cpNumber]);
			return rows[0] || null;
		} catch (error) {
			throw error;
		}
	},

	/**
	 * Update user's CP number and activate account
	 * @param {number} userId - User's ID
	 * @param {string} cpNumber - CP number to assign
	 * @returns {Promise<boolean>} Success status
	 */
	async updateCPNumber(userId, cpNumber) {
		const sql = `
            UPDATE users 
            SET cp_number = ?,
                cp_issued_date = CURRENT_TIMESTAMP,
                cp_status = 'ACTIVE',
                account_status = 'ACTIVE',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
		try {
			const [result] = await pool.execute(sql, [cpNumber, userId]);
			return result.affectedRows > 0;
		} catch (error) {
			if (error.code === "ER_DUP_ENTRY") {
				throw new Error("CP number already assigned to another user");
			}
			throw error;
		}
	},

	/**
	 * Verify login credentials and CP status
	 * @param {string} email - User's email
	 * @param {string} cpNumber - User's CP number
	 * @returns {Promise<Object|null>} User object if verified, null otherwise
	 */
	async verifyLoginCredentials(email, cpNumber) {
		const sql = `
            SELECT * FROM users 
            WHERE email = ? 
            AND cp_number = ?
            AND cp_status = 'ACTIVE'
            AND account_status = 'ACTIVE'
            LIMIT 1
        `;
		try {
			const [rows] = await pool.execute(sql, [email, cpNumber]);
			return rows[0] || null;
		} catch (error) {
			throw error;
		}
	},

	/**
	 * Update user's password
	 * @param {number} userId - User's ID
	 * @param {string} newPasswordHash - New hashed password
	 * @returns {Promise<boolean>} Success status
	 */
	async updatePassword(userId, newPasswordHash) {
		const sql = `
            UPDATE users 
            SET password = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
		try {
			const [result] = await pool.execute(sql, [newPasswordHash, userId]);
			return result.affectedRows > 0;
		} catch (error) {
			throw error;
		}
	},

	/**
	 * Update user's account status
	 * @param {number} userId - User's ID
	 * @param {string} status - New account status
	 * @param {string} reason - Reason for status change
	 * @returns {Promise<boolean>} Success status
	 */
	async updateAccountStatus(userId, status, reason) {
		const sql = `
            UPDATE users 
            SET account_status = ?,
                modification_reason = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
		try {
			const [result] = await pool.execute(sql, [status, reason, userId]);
			return result.affectedRows > 0;
		} catch (error) {
			throw error;
		}
	},

	/**
	 * Log failed login attempt
	 * @param {number} userId - User's ID
	 * @param {string} ipAddress - IP address of the attempt
	 * @returns {Promise<void>}
	 */
	async logLoginAttempt(userId, ipAddress) {
		const sql = `
            INSERT INTO login_attempts (
                user_id,
                ip_address,
                success,
                attempt_details
            ) VALUES (?, ?, FALSE, 'Failed login attempt')
        `;
		try {
			await pool.execute(sql, [userId, ipAddress]);
		} catch (error) {
			console.error("Error logging login attempt:", error);
			// Don't throw - we don't want to interrupt the login process
		}
	},

	/**
	 * Get user's login attempts within timeframe
	 * @param {number} userId - User's ID
	 * @param {number} minutes - Timeframe in minutes
	 * @returns {Promise<number>} Number of failed attempts
	 */
	async getRecentLoginAttempts(userId, minutes) {
		const sql = `
            SELECT COUNT(*) as count
            FROM login_attempts
            WHERE user_id = ?
            AND attempt_time > DATE_SUB(NOW(), INTERVAL ? MINUTE)
            AND success = FALSE
        `;
		try {
			const [rows] = await pool.execute(sql, [userId, minutes]);
			return rows[0].count;
		} catch (error) {
			throw error;
		}
	},
};

module.exports = userModel;
