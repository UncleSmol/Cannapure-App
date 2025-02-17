"use strict";

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const pool = require("./config");

// Environment-specific configurations
const envConfig = {
	development: {
		loginAttempts: 10,
		logDetails: true,
	},
	production: {
		loginAttempts: 5,
		logDetails: false,
	},
};

const currentEnv = process.env.NODE_ENV || "development";
const config = envConfig[currentEnv];

// Local strategy for login
passport.use(
	"local",
	new LocalStrategy(
		{
			usernameField: "email",
			passwordField: "loginPassword",
			passReqToCallback: true, // Allow access to request object
		},
		async (req, email, password, done) => {
			try {
				// Development logging
				if (config.logDetails) {
					console.log("Login attempt:", { email, cpNumber: req.body.cpNumber });
				}

				// Find user by email and CP number
				const [users] = await pool.query(
					`SELECT * FROM users 
                    WHERE email = ? 
                    AND cp_number = ?
                    AND cp_status = 'ACTIVE'`,
					[email, req.body.cpNumber]
				);

				if (users.length === 0) {
					if (config.logDetails) {
						console.log("User not found or inactive CP number");
					}
					return done(null, false, {
						message: "Invalid credentials or inactive CP number.",
					});
				}

				const user = users[0];

				// Verify password
				const isMatch = await bcrypt.compare(password, user.password);
				if (!isMatch) {
					if (config.logDetails) {
						console.log("Invalid password for user:", email);
					}
					return done(null, false, {
						message: "Invalid credentials.",
					});
				}

				// Check account status
				if (user.account_status !== "ACTIVE") {
					if (config.logDetails) {
						console.log("Account not active:", email);
					}
					return done(null, false, {
						message: "Account is not active.",
					});
				}

				if (config.logDetails) {
					console.log("Successful login:", email);
				}
				return done(null, user);
			} catch (err) {
				if (config.logDetails) {
					console.error("Login error:", err);
				}
				return done(err);
			}
		}
	)
);

// Serialize user for the session
passport.serializeUser((user, done) => {
	if (config.logDetails) {
		console.log("Serializing user:", user.id);
	}
	done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
	try {
		const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

		if (users.length === 0) {
			if (config.logDetails) {
				console.log("User not found during deserialization:", id);
			}
			return done(null, false);
		}

		if (config.logDetails) {
			console.log("Deserialized user:", id);
		}
		done(null, users[0]);
	} catch (err) {
		if (config.logDetails) {
			console.error("Deserialization error:", err);
		}
		done(err);
	}
});

module.exports = passport;
