/**
 * Server Configuration and Initialization
 * =====================================
 * Main server file for Cannapure+ application
 */

// Environment and Core Dependencies
require("dotenv").config();
const express = require("express");
const compression = require("compression");
const path = require("path");
const cookieParser = require("cookie-parser");

// Security Dependencies
const helmet = require("helmet");
const cors = require("cors");
const csrf = require("csurf");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const device = require("express-device");
const passwordUtils = require("./utils/passwordUtils");
const validationMiddleware = require("./middleware/validation");


// Authentication Dependencies
const passport = require("./db/passport");
const authRoutes = require("./routes/auth");


// Database Configuration
const pool = require("./db/config");

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Security Middleware Configuration
 * ===============================
 */

// Environment-based Security Headers Configuration
const helmetConfig =
	process.env.NODE_ENV === "production"
		? {
				// Production configuration
				contentSecurityPolicy: {
					directives: {
						defaultSrc: ["'self'"],
						scriptSrc: ["'self'"],
						styleSrc: ["'self'"],
						imgSrc: ["'self'"],
						connectSrc: ["'self'"],
						fontSrc: ["'self'"],
						objectSrc: ["'none'"],
						mediaSrc: ["'self'"],
						frameSrc: ["'none'"],
						formAction: ["'self'"],
						upgradeInsecureRequests: [],
					},
				},
				crossOriginEmbedderPolicy: true,
				crossOriginOpenerPolicy: true,
				crossOriginResourcePolicy: { policy: "same-site" },
				dnsPrefetchControl: { allow: false },
				frameguard: { action: "deny" },
				hsts: {
					maxAge: 31536000,
					includeSubDomains: true,
					preload: true,
				},
				referrerPolicy: { policy: "strict-origin-when-cross-origin" },
				strictTransportSecurity: true,
				xssFilter: true,
				noSniff: true,
		  }
		: {
				// Development configuration
				contentSecurityPolicy: {
					directives: {
						defaultSrc: ["'self'"],
						scriptSrc: [
							"'self'",
							"'unsafe-inline'",
							"'unsafe-eval'",
							"https://cdn.jsdelivr.net",
						],
						scriptSrcAttr: ["'unsafe-inline'"],
						styleSrc: [
							"'self'",
							"'unsafe-inline'",
							"https://cdn.jsdelivr.net",
							"https://fonts.googleapis.com",
						],
						fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
						imgSrc: ["'self'", "data:", "https:"],
						connectSrc: ["'self'", "ws:", "wss:"],
						styleSrcElem: [
							"'self'",
							"'unsafe-inline'",
							"https://cdn.jsdelivr.net",
							"https://fonts.googleapis.com",
						],
						workerSrc: ["'self'", "blob:"],
						childSrc: ["'self'", "blob:"],
						frameSrc: ["'self'"],
						manifestSrc: ["'self'"],
						mediaSrc: ["'self'"],
						objectSrc: ["'none'"],
					},
					reportOnly: true, // Logs violations without blocking during development
				},
				crossOriginEmbedderPolicy: false,
				crossOriginResourcePolicy: false,
				permissionsPolicy: {
					features: {
						"storage-access": ["'self'", "https://fonts.gstatic.com"],
						"font-access": ["'self'", "https://fonts.gstatic.com"],
					},
				},
		  };

// Apply configuration
app.use(helmet(helmetConfig));

// Rate Limiting Configuration
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // 5 attempts
	handler: (req, res) => {
		const timeRemaining = Math.ceil(req.rateLimit.resetTime / 1000 / 60);
		res.status(429).json({
			success: false,
			error: "Security Notice",
			details: {
				message: `Maximum login attempts reached`,
				timeRemaining: `Please wait ${timeRemaining} minutes before trying again`,
				suggestion:
					'If you forgot your password, use the "Forgot Password" option',
				support: "Need help? Contact our support team",
			},
		});
	},
});

/**
 * Middleware Configuration
 * ======================
 */

// Basic Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Required for CSRF
app.use(compression({ level: 6 }));
app.use(express.static(path.join(__dirname)));

// CORS Configuration with CSRF support
app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		methods: process.env.ALLOWED_METHODS.split(","),
		allowedHeaders: [...process.env.ALLOWED_HEADERS.split(","), "XSRF-TOKEN"],
		credentials: true,
	})
);

// Session Configuration
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			maxAge: parseInt(process.env.SESSION_DURATION) * 1000,
			sameSite: "strict",
		},
	})
);

// Device Detection
app.use(device.capture());

// Authentication Middleware
app.use(passport.initialize());
app.use(passport.session());

// CSRF Protection Setup
app.use(csrf({ cookie: true }));

// CSRF Token Handler
app.use((req, res, next) => {
	res.cookie("XSRF-TOKEN", req.csrfToken(), {
		httpOnly: false,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});
	next();
});

// CSRF Error Handler
app.use((err, req, res, next) => {
	if (err.code === "EBADCSRFTOKEN") {
		console.error("CSRF Token Error:", err.message);
		return res.status(403).json({
			success: false,
			error: "Invalid CSRF token",
			details: "CSRF token validation failed",
		});
	}
	next(err);
});

/**
 * Route Protection
 * ===============
 */

// Apply rate limiter to authentication routes
app.use("/api/auth/login", loginLimiter);

/**
 * Routes Configuration
 * ==================
 */

// Authentication Routes
app.use("/api/auth", authRoutes);

/**
 * Security Test Endpoints
 * =====================
 */

// CSRF Test Endpoints
app.get("/api/test/csrf-token", (req, res) => {
	try {
		console.log("1. CSRF token request received");
		console.log("2. Cookies present:", req.cookies);

		const token = req.csrfToken();
		console.log("3. Generated token:", token);

		// Set cookie explicitly
		res.cookie("XSRF-TOKEN", token, {
			httpOnly: false,
			secure: false, // Set to true in production
			sameSite: "lax",
		});

		console.log("4. Cookie set, sending response");
		res.json({
			success: true,
			csrfToken: token,
		});
	} catch (error) {
		console.error("CSRF Error:", error);
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

/**
 * API Endpoints
 * ============
 */

// Weekly Specials Endpoint
app.get("/api/weekly_specials", async (req, res) => {
	try {
		const store = req.query.store;
		console.log("Fetching weekly specials for store:", store);

		let query = "SELECT * FROM weekly_specials WHERE store_location = ?";
		const params = [store];
		query += " ORDER BY created_at DESC";

		const [specials] = await pool.query(query, params);
		console.log(`Found ${specials.length} weekly specials`);

		res.json({
			success: true,
			count: specials.length,
			data: specials,
		});
	} catch (error) {
		console.error("Weekly specials fetch error:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch weekly specials",
			details: error.message,
		});
	}
});

// Categories Configuration
const categories = [
	"normal_strains",
	"greenhouse_strains",
	"exotic_tunnel_strains",
	"indoor_strains",
	"medical_strains",
	"pre_rolled",
	"extracts_vapes",
	"edibles",
];

// Generate Category Endpoints
categories.forEach((category) => {
	app.get(`/api/${category}`, async (req, res) => {
		try {
			const store = req.query.store;
			console.log(`Fetching ${category} for store:`, store);

			let query = `SELECT * FROM ${category} WHERE store_location = ?`;
			const params = [store];
			query += " ORDER BY created_at DESC";

			const [items] = await pool.query(query, params);
			console.log(`Found ${items.length} items in ${category}`);

			res.json({
				success: true,
				count: items.length,
				data: items,
			});
		} catch (error) {
			console.error(`${category} fetch error:`, error);
			res.status(500).json({
				success: false,
				error: `Failed to fetch ${category}`,
				details: error.message,
			});
		}
	});
});

// Store Locations Endpoint
app.get("/api/stores", async (req, res) => {
	try {
		const [stores] = await pool.query(
			"SELECT DISTINCT store_location FROM weekly_specials WHERE store_location IS NOT NULL"
		);

		res.json({
			success: true,
			count: stores.length,
			data: stores,
		});
	} catch (error) {
		console.error("Stores fetch error:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch store locations",
			details: error.message,
		});
	}
});

/**
 * Debug/Test Endpoints
 * ==================
 */

app.get("/api/test/connection", async (req, res) => {
	try {
		const [result] = await pool.query("SELECT 1");
		res.json({
			success: true,
			message: "Database connection successful",
			data: result,
		});
	} catch (error) {
		console.error("Connection test failed:", error);
		res.status(500).json({
			success: false,
			error: "Database connection failed",
			details: error.message,
		});
	}
});

app.get("/api/test/auth-controller", (req, res) => {
	const testPage = `
        <html>
            <head>
                <title>Auth Controller Test</title>
                <style>
                    .container { max-width: 800px; margin: 20px auto; padding: 20px; }
                    .test-section { 
                        margin-bottom: 20px; 
                        padding: 15px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                    }
                    .form-group { margin-bottom: 15px; }
                    .form-group label { 
                        display: block; 
                        margin-bottom: 5px;
                        font-weight: bold;
                    }
                    .form-control { 
                        width: 100%; 
                        padding: 8px;
                        margin-bottom: 5px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }
                    .result { 
                        margin-top: 10px; 
                        padding: 10px; 
                        background: #f5f5f5;
                        border-radius: 4px;
                    }
                    .error { color: red; }
                    .success { color: green; }
                    button { 
                        padding: 8px 15px;
                        margin: 5px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    button:hover { background: #0056b3; }
                    .nav-tabs {
                        display: flex;
                        margin-bottom: 20px;
                        border-bottom: 1px solid #ddd;
                    }
                    .nav-tab {
                        padding: 10px 20px;
                        cursor: pointer;
                        border: 1px solid transparent;
                        margin-bottom: -1px;
                    }
                    .nav-tab.active {
                        border: 1px solid #ddd;
                        border-bottom-color: white;
                        border-radius: 4px 4px 0 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Auth Controller Test</h2>
                    
                    <div class="nav-tabs">
                        <div class="nav-tab active" onclick="showSection('register')">Register</div>
                        <div class="nav-tab" onclick="showSection('login')">Login</div>
                        <div class="nav-tab" onclick="showSection('cp')">CP Number</div>
                        <div class="nav-tab" onclick="showSection('profile')">Profile</div>
                    </div>

                    <!-- Registration Section -->
                    <div id="registerSection" class="test-section">
                        <h3>Registration Tests</h3>
                        <form id="registerForm">
                            <div class="form-group">
                                <label>ID Number:</label>
                                <input type="text" name="idNumber" class="form-control" value="9801015800084">
                            </div>
                            <div class="form-group">
                                <label>First Name:</label>
                                <input type="text" name="firstName" class="form-control" value="Test">
                            </div>
                            <div class="form-group">
                                <label>Surname:</label>
                                <input type="text" name="surname" class="form-control" value="User">
                            </div>
                            <div class="form-group">
                                <label>Email:</label>
                                <input type="email" name="email" class="form-control" value="test@example.com">
                            </div>
                            <div class="form-group">
                                <label>Phone:</label>
                                <input type="text" name="phone" class="form-control" value="0721234567">
                            </div>
                            <div class="form-group">
                                <label>Address:</label>
                                <textarea name="residentialAddress" class="form-control">123 Test Street, Test City</textarea>
                            </div>
                            <div class="form-group">
                                <label>Password:</label>
                                <input type="password" name="password" class="form-control" value="Test@123456">
                            </div>
                            <button type="submit">Test Registration</button>
                        </form>
                        <div id="registerResult" class="result"></div>
                    </div>

                    <!-- Login Section -->
                    <div id="loginSection" class="test-section" style="display:none;">
                        <h3>Login Tests</h3>
                        <form id="loginForm">
                            <div class="form-group">
                                <label>Email:</label>
                                <input type="email" name="email" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>CP Number:</label>
                                <input type="text" name="cpNumber" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Password:</label>
                                <input type="password" name="password" class="form-control">
                            </div>
                            <button type="submit">Test Login</button>
                        </form>
                        <button onclick="testLogout()">Test Logout</button>
                        <div id="loginResult" class="result"></div>
                    </div>

                    <!-- CP Number Section -->
                    <div id="cpSection" class="test-section" style="display:none;">
                        <h3>CP Number Assignment Test</h3>
                        <form id="cpForm">
                            <div class="form-group">
                                <label>User ID:</label>
                                <input type="text" name="userId" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>CP Number:</label>
                                <input type="text" name="cpNumber" class="form-control" value="CP123456">
                            </div>
                            <button type="submit">Assign CP Number</button>
                        </form>
                        <div id="cpResult" class="result"></div>
                    </div>

                    <!-- Profile Section -->
                    <div id="profileSection" class="test-section" style="display:none;">
                        <h3>Profile Tests</h3>
                        <button onclick="getProfile()">Get Profile</button>
                        <form id="updateProfileForm">
                            <div class="form-group">
                                <label>Phone:</label>
                                <input type="text" name="phone" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Address:</label>
                                <textarea name="residentialAddress" class="form-control"></textarea>
                            </div>
                            <button type="submit">Update Profile</button>
                        </form>
                        <div id="profileResult" class="result"></div>
                    </div>
                </div>

                <script>
                    // Show/Hide Sections
                    function showSection(section) {
                        document.querySelectorAll('.test-section').forEach(el => el.style.display = 'none');
                        document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
                        document.getElementById(section + 'Section').style.display = 'block';
                        event.target.classList.add('active');
                    }

                    // Handle Registration
                    document.getElementById('registerForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        try {
                            const response = await fetch('/api/auth/register', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'CSRF-Token': '${req.csrfToken()}'
                                },
                                body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
                            });
                            const result = await response.json();
                            document.getElementById('registerResult').innerHTML = 
                                '<pre class="' + (response.ok ? 'success' : 'error') + '">' + 
                                JSON.stringify(result, null, 2) + '</pre>';
                        } catch (error) {
                            document.getElementById('registerResult').innerHTML = 
                                '<pre class="error">Error: ' + error.message + '</pre>';
                        }
                    });

                    // Handle Login
                    document.getElementById('loginForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        try {
                            const response = await fetch('/api/auth/login', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'CSRF-Token': '${req.csrfToken()}'
                                },
                                body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
                            });
                            const result = await response.json();
                            document.getElementById('loginResult').innerHTML = 
                                '<pre class="' + (response.ok ? 'success' : 'error') + '">' + 
                                JSON.stringify(result, null, 2) + '</pre>';
                        } catch (error) {
                            document.getElementById('loginResult').innerHTML = 
                                '<pre class="error">Error: ' + error.message + '</pre>';
                        }
                    });

                    // Handle Logout
                    async function testLogout() {
                        try {
                            const response = await fetch('/api/auth/logout', {
                                method: 'POST',
                                headers: {
                                    'CSRF-Token': '${req.csrfToken()}'
                                }
                            });
                            const result = await response.json();
                            document.getElementById('loginResult').innerHTML = 
                                '<pre class="' + (response.ok ? 'success' : 'error') + '">' + 
                                JSON.stringify(result, null, 2) + '</pre>';
                        } catch (error) {
                            document.getElementById('loginResult').innerHTML = 
                                '<pre class="error">Error: ' + error.message + '</pre>';
                        }
                    }

                    // Handle CP Number Assignment
                    document.getElementById('cpForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        try {
                            const response = await fetch('/api/auth/assign-cp', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'CSRF-Token': '${req.csrfToken()}'
                                },
                                body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
                            });
                            const result = await response.json();
                            document.getElementById('cpResult').innerHTML = 
                                '<pre class="' + (response.ok ? 'success' : 'error') + '">' + 
                                JSON.stringify(result, null, 2) + '</pre>';
                        } catch (error) {
                            document.getElementById('cpResult').innerHTML = 
                                '<pre class="error">Error: ' + error.message + '</pre>';
                        }
                    });

                    // Get Profile
                    async function getProfile() {
                        try {
                            const response = await fetch('/api/auth/profile');
                            const result = await response.json();
                            document.getElementById('profileResult').innerHTML = 
                                '<pre class="' + (response.ok ? 'success' : 'error') + '">' + 
                                JSON.stringify(result, null, 2) + '</pre>';
                        } catch (error) {
                            document.getElementById('profileResult').innerHTML = 
                                '<pre class="error">Error: ' + error.message + '</pre>';
                        }
                    }

                    // Update Profile
                    document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        try {
                            const response = await fetch('/api/auth/profile', {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'CSRF-Token': '${req.csrfToken()}'
                                },
                                body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
                            });
                            const result = await response.json();
                            document.getElementById('profileResult').innerHTML = 
                                '<pre class="' + (response.ok ? 'success' : 'error') + '">' + 
                                JSON.stringify(result, null, 2) + '</pre>';
                        } catch (error) {
                            document.getElementById('profileResult').innerHTML = 
                                '<pre class="error">Error: ' + error.message + '</pre>';
                        }
                    });
                </script>
            </body>
        </html>
    `;
	res.send(testPage);
});


/**
 * Fallback Route
 * =============
 */

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

/**
 * Server Initialization
 * ===================
 */

const startServer = async () => {
	try {
		const [testResult] = await pool.query("SELECT 1");
		console.log("✅ Database connection successful");

		app.listen(PORT, () => {
			console.log(`✅ Server running on port ${PORT}`);
			console.log(`🔒 Security features enabled:`);
			console.log(`   - Rate limiting`);
			console.log(`   - CSRF protection`);
			console.log(`   - Secure sessions`);
			console.log(`   - Helmet security headers`);
			console.log(`📡 API endpoints ready:`);
			console.log(`   - /api/weekly_specials`);
			categories.forEach((category) => {
				console.log(`   - /api/${category}`);
			});
		});
	} catch (err) {
		console.error("❌ Server startup error:", err);
		process.exit(1);
	}
};

/**
 * Global Error Handling
 * ===================
 */

process.on("uncaughtException", (err) => {
	console.error("Uncaught Exception:", err);
	setTimeout(() => {
		process.exit(1);
	}, 1000).unref();
});

process.on("unhandledRejection", (err) => {
	console.error("Unhandled Rejection:", err);
	setTimeout(() => {
		process.exit(1);
	}, 1000).unref();
});

// Start the server
startServer();
