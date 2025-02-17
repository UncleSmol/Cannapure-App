/**
 * Validation Middleware
 * ===================
 * Handles input validation and sanitization for all authentication routes
 */

const { body, validationResult } = require("express-validator");
const passwordUtils = require("../utils/passwordUtils");

const validationMiddleware = {
	/**
	 * Validation rules for registration
	 */
	registerValidation: [
		// ID Number Validation
		body("idNumber")
			.trim()
			.notEmpty()
			.withMessage("ID number is required")
			.matches(/^[0-9]{13}$/)
			.withMessage("Invalid South African ID number")
			.custom((value) => {
				// Extract date from ID number
				const year = parseInt(value.substring(0, 2));
				const month = parseInt(value.substring(2, 4));
				const day = parseInt(value.substring(4, 6));

				// Basic date validation
				if (month < 1 || month > 12) return false;
				if (day < 1 || day > 31) return false;

				// Calculate age
				const currentYear = new Date().getFullYear();
				const birthYear = year + (year < 22 ? 2000 : 1900); // Adjust this logic as needed
				const age = currentYear - birthYear;

				if (age < 18) {
					throw new Error("Must be 18 or older to register");
				}
				return true;
			}),

		// Name Validations
		body("firstName")
			.trim()
			.notEmpty()
			.withMessage("First name is required")
			.isLength({ min: 2, max: 50 })
			.withMessage("First name must be between 2 and 50 characters")
			.matches(/^[A-Za-z\s-']+$/)
			.withMessage(
				"First name can only contain letters, spaces, hyphens and apostrophes"
			),

		body("surname")
			.trim()
			.notEmpty()
			.withMessage("Surname is required")
			.isLength({ min: 2, max: 50 })
			.withMessage("Surname must be between 2 and 50 characters")
			.matches(/^[A-Za-z\s-']+$/)
			.withMessage(
				"Surname can only contain letters, spaces, hyphens and apostrophes"
			),

		// Email Validation
		body("email")
			.trim()
			.notEmpty()
			.withMessage("Email is required")
			.isEmail()
			.withMessage("Invalid email address")
			.normalizeEmail(),

		// Phone Validation
		body("phone")
			.trim()
			.notEmpty()
			.withMessage("Phone number is required")
			.matches(/^(?:\+27|0)[6-8][0-9]{8}$/)
			.withMessage("Invalid South African phone number"),

		// Address Validation
		body("residentialAddress")
			.trim()
			.notEmpty()
			.withMessage("Residential address is required")
			.isLength({ min: 10, max: 200 })
			.withMessage("Address must be between 10 and 200 characters"),

		// Password Validation
		body("password")
			.notEmpty()
			.withMessage("Password is required")
			.custom((value) => {
				const validation = passwordUtils.validatePassword(value);
				if (!validation.isValid) {
					throw new Error(validation.errors.join(". "));
				}
				return true;
			}),
	],

	/**
	 * Validation rules for login
	 */
	loginValidation: [
		body("email")
			.trim()
			.notEmpty()
			.withMessage("Email is required")
			.isEmail()
			.withMessage("Invalid email address")
			.normalizeEmail(),

		body("cpNumber")
			.trim()
			.notEmpty()
			.withMessage("CP number is required")
			.matches(/^CP[0-9]{6}$/)
			.withMessage("Invalid CP number format"),

		body("password").notEmpty().withMessage("Password is required"),
	],

	/**
	 * Validation rules for password reset request
	 */
	passwordResetRequestValidation: [
		body("email")
			.trim()
			.notEmpty()
			.withMessage("Email is required")
			.isEmail()
			.withMessage("Invalid email address")
			.normalizeEmail(),
	],

	/**
	 * Validation rules for password reset
	 */
	passwordResetValidation: [
		body("token").trim().notEmpty().withMessage("Reset token is required"),

		body("password")
			.notEmpty()
			.withMessage("Password is required")
			.custom((value) => {
				const validation = passwordUtils.validatePassword(value);
				if (!validation.isValid) {
					throw new Error(validation.errors.join(". "));
				}
				return true;
			}),
	],

	/**
	 * Validation rules for CP number update
	 */
	cpNumberValidation: [
		body("cpNumber")
			.trim()
			.notEmpty()
			.withMessage("CP number is required")
			.matches(/^CP[0-9]{6}$/)
			.withMessage("Invalid CP number format"),

		body("userId")
			.trim()
			.notEmpty()
			.withMessage("User ID is required")
			.isNumeric()
			.withMessage("Invalid user ID"),
	],

	/**
	 * Validate request and handle errors
	 */
	validate: (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				errors: errors.array().map((err) => ({
					field: err.param,
					message: err.msg,
				})),
			});
		}
		next();
	},

	/**
	 * Sanitize request body
	 */
	sanitizeBody: (req, res, next) => {
		// Remove any HTML tags from text fields
		Object.keys(req.body).forEach((key) => {
			if (typeof req.body[key] === "string") {
				req.body[key] = req.body[key]
					.replace(/<[^>]*>/g, "") // Remove HTML tags
					.trim(); // Remove leading/trailing spaces
			}
		});
		next();
	},
};

module.exports = validationMiddleware;
