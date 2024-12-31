require("dotenv").config();
const express = require("express");
const compression = require("compression");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

// Test route for database connection
app.get("/api/test-db", async (req, res) => {
	try {
		const client = await pool.connect();
		const result = await client.query("SELECT NOW()");
		client.release();

		res.json({
			success: true,
			message: "Database connected successfully",
			timestamp: result.rows[0].now,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: "Database connection error",
			error: err.message,
		});
	}
});

// Existing middleware
app.use(
	compression({
		level: parseInt(process.env.COMPRESSION_LEVEL) || 6,
	})
);
app.use(express.static(__dirname));

// Existing routes
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
