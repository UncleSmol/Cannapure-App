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
app.use(express.static(__dirname));

// Database test route
app.get("/api/strains", async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT * FROM strains WHERE in_stock = true"
		);
		res.json(result.rows);
	} catch (err) {
		console.error("Database error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Your existing routes
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
