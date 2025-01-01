require("dotenv").config();
const express = require("express");
const compression = require("compression");
const path = require("path");
const pool = require("./db/config");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(
	compression({
		level: parseInt(process.env.COMPRESSION_LEVEL) || 6,
	})
);

// API Routes - Put these BEFORE static files middleware
app.get("/api/test-db", async (req, res) => {
	try {
		const result = await pool.query("SELECT NOW()");
		res.json({
			status: "success",
			message: "Database connected successfully",
			timestamp: result.rows[0].now,
		});
	} catch (err) {
		console.error("Database connection error:", err);
		res.status(500).json({
			status: "error",
			message: "Database connection failed",
			error: err.message,
		});
	}
});

// Weekly Specials endpoint
app.get("/api/weekly-specials", async (req, res) => {
	try {
		const currentDate = "2025-01-01";
		const result = await pool.query(
			"SELECT * FROM weekly_specials WHERE in_stock = true"
		);
		console.log("Weekly specials query results:", result.rows);
		res.json(result.rows);
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({
			error: "Failed to fetch weekly specials",
			details: err.message,
		});
	}
});

// Normal Strains endpoint
app.get("/api/normal-strains", async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT * FROM normal_strains WHERE in_stock = true ORDER BY strain_name"
		);
		console.log("Normal strains query results:", result.rows);
		res.json(result.rows);
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({
			error: "Failed to fetch normal strains",
			details: err.message,
		});
	}
});

// Outdoor Strains endpoint
app.get("/api/outdoor-strains", async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT * FROM outdoor_strains WHERE in_stock = true ORDER BY strain_name"
		);
		console.log("Outdoor strains query results:", result.rows);
		res.json(result.rows);
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({
			error: "Failed to fetch outdoor strains",
			details: err.message,
		});
	}
});

// Static files middleware - Put this AFTER API routes
app.use(express.static(__dirname));

// Catch-all route - Put this LAST
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
