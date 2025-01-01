require("dotenv").config();
const express = require("express");
const compression = require("compression");
const path = require("path");
const pool = require("./db/config");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(
	compression({
		level: parseInt(process.env.COMPRESSION_LEVEL) || 6,
	})
);
app.use(cors());

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

// Database test endpoint
app.get("/api/test-db", async (req, res) => {
	try {
		const result = await pool.query("SELECT NOW()");
		res.json({
			status: "success",
			message: "Database connected successfully",
			timestamp: result.rows[0].now,
		});
	} catch (err) {
		console.error("Database error:", err);
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
			`SELECT * FROM weekly_specials 
             WHERE start_date <= $1 
             AND end_date >= $1 
             AND in_stock = true 
             ORDER BY strain_name`,
			[currentDate]
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
			`SELECT * FROM normal_strains 
             WHERE in_stock = true 
             ORDER BY strain_name`
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
			`SELECT * FROM outdoor_strains 
             WHERE in_stock = true 
             ORDER BY strain_name`
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

// Greenhouse Strains endpoint
app.get("/api/greenhouse-strains", async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT * FROM greenhouse_strains 
             WHERE in_stock = true 
             ORDER BY strain_name`
		);
		console.log("Greenhouse strains query results:", result.rows);
		res.json(result.rows);
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({
			error: "Failed to fetch greenhouse strains",
			details: err.message,
		});
	}
});

// AAA Greenhouse Strains endpoint
app.get("/api/aaa-greenhouse-strains", async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT * FROM aaa_greenhouse_strains 
             WHERE in_stock = true 
             ORDER BY strain_name`
		);
		console.log("AAA Greenhouse strains query results:", result.rows);
		res.json(result.rows);
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({
			error: "Failed to fetch AAA greenhouse strains",
			details: err.message,
		});
	}
});

// AAA Indoor Strains endpoint
app.get("/api/aaa-indoor-strains", async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT * FROM aaa_indoor_strains 
             WHERE in_stock = true 
             ORDER BY strain_name`
		);
		console.log("AAA Indoor strains query results:", result.rows);
		res.json(result.rows);
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({
			error: "Failed to fetch AAA indoor strains",
			details: err.message,
		});
	}
});

// Pre-Rolled endpoint
app.get("/api/pre-rolled", async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT * FROM pre_rolled 
             WHERE in_stock = true 
             ORDER BY strain_name`
		);
		console.log("Pre-rolled query results:", result.rows);
		res.json(result.rows);
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({
			error: "Failed to fetch pre-rolled products",
			details: err.message,
		});
	}
});

// Extracts and Vapes endpoint
app.get("/api/extracts-and-vapes", async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT * FROM extracts_and_vapes 
             WHERE in_stock = true 
             ORDER BY product_name`
		);
		console.log("Extracts and vapes query results:", result.rows);
		res.json(result.rows);
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({
			error: "Failed to fetch extracts and vapes",
			details: err.message,
		});
	}
});

// Edibles endpoint
app.get("/api/edibles", async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT * FROM edibles 
             WHERE in_stock = true 
             ORDER BY product_name`
		);
		console.log("Edibles query results:", result.rows);
		res.json(result.rows);
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({
			error: "Failed to fetch edibles",
			details: err.message,
		});
	}
});

// Members endpoint
app.get("/api/membership/:number", async (req, res) => {
    try {
        const membershipNumber = req.params.number;
        console.log("Searching for membership number:", membershipNumber);

        const result = await pool.query(
            `SELECT 
                membership_number,
                status,
                join_date,
                days_active,
                last_renewal_date,
                next_renewal_date
             FROM members 
             WHERE membership_number = $1`,
            [membershipNumber]
        );

        if (result.rows.length === 0) {
            console.log("No membership found for number:", membershipNumber);
            return res.status(404).json({ 
                error: 'Membership not found',
                message: 'Please check your membership number and try again.'
            });
        }

        console.log("Membership found:", result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({
            error: "Failed to fetch membership details",
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
