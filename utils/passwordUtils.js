/**
 * Password Utilities
 * =================
 * Production-ready password management utilities
 */

const bcrypt = require("bcrypt");

const passwordUtils = {
	// Configuration based on environment
	config: {
		saltRounds: process.env.NODE_ENV === "production" ? 12 : 10,
		requirements: {
			minLength: 8,
			maxLength: 128,
			minUppercase: 1,
			minLowercase: 1,
			minNumbers: 1,
			minSpecialChars: 1,
			specialChars: '!@#$%^&*(),.?":{}|<>',
		},
	},

	// Production Methods
	async hashPassword(password) {
		try {
			return await bcrypt.hash(password, this.config.saltRounds);
		} catch (error) {
			throw new Error("Password hashing failed");
		}
	},

	async verifyPassword(password, hash) {
		try {
			return await bcrypt.compare(password, hash);
		} catch (error) {
			throw new Error("Password verification failed");
		}
	},

	validatePassword(password) {
		const validation = {
			isValid: true,
			errors: [],
			score: 0,
			requirements: {},
		};

		// Required checks
		const checks = [
			{
				test: (p) => p.length >= this.config.requirements.minLength,
				error: `Password must be at least ${this.config.requirements.minLength} characters`,
				requirement: "length",
			},
			{
				test: (p) => /[A-Z]/.test(p),
				error: "Must contain uppercase letter",
				requirement: "uppercase",
			},
			{
				test: (p) => /[a-z]/.test(p),
				error: "Must contain lowercase letter",
				requirement: "lowercase",
			},
			{
				test: (p) => /\d/.test(p),
				error: "Must contain number",
				requirement: "numbers",
			},
			{
				test: (p) =>
					new RegExp(`[${this.config.requirements.specialChars}]`).test(p),
				error: "Must contain special character",
				requirement: "specialChars",
			},
		];

		// Run all checks
		checks.forEach((check) => {
			const passes = check.test(password);
			validation.requirements[check.requirement] = passes;
			if (!passes) {
				validation.errors.push(check.error);
				validation.isValid = false;
			} else {
				validation.score++;
			}
		});

		// Additional strength scoring
		if (password.length >= 12) validation.score++;
		if (password.length >= 16) validation.score++;
		if (/[A-Z].*[A-Z]/.test(password)) validation.score++;

		return validation;
	},

	// Production helper methods
	isPasswordStrong(validation) {
		return validation.score >= 6;
	},

	getPasswordStrength(validation) {
		if (validation.score < 3) return "Weak";
		if (validation.score < 5) return "Moderate";
		if (validation.score < 7) return "Strong";
		return "Very Strong";
	},
};

module.exports = passwordUtils;
