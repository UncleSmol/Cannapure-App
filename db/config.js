const dotenv = require("dotenv");
const mysql = require("mysql2");

// Configure dotenv
const result = dotenv.config();
if (result.error) {
	throw result.error;
}

// Load the correct environment
const env = process.env.NODE_ENV || "development";
console.log(`Loading ${env} environment configuration`);

// Log configuration being used
console.log("Database Configuration:", {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	environment: env,
});

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT || 3306,
	connectionLimit: 10,
	waitForConnections: true,
	queueLimit: 0,
	enableKeepAlive: true,
	keepAliveInitialDelay: 0,
});

// Test the connection
pool.getConnection((err, connection) => {
	if (err) {
		console.error("Database Connection Error:", err);
		if (err.code === "PROTOCOL_CONNECTION_LOST") {
			console.error("Database connection was closed.");
		}
		if (err.code === "ER_CON_COUNT_ERROR") {
			console.error("Database has too many connections.");
		}
		if (err.code === "ECONNREFUSED") {
			console.error("Database connection was refused.");
		}
		if (err.code === "ECONNRESET") {
			console.error("Database connection was reset.");
		}
	}
	if (connection) {
		console.log("Successfully connected to the database.");
		connection.release();
	}
});

// Convert pool to promise pool
const promisePool = pool.promise();

// Handle pool errors
pool.on("error", (err) => {
	console.error("Unexpected error on idle database connection:", err);
	process.exit(-1);
});

module.exports = promisePool;
