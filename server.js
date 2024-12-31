require("dotenv").config();
const express = require("express");
const compression = require("compression");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Configure compression with parsed integer level
app.use(
	compression({
		level: parseInt(process.env.COMPRESSION_LEVEL) || 6,
	})
);

// Serve static files
app.use(express.static(__dirname));

// Basic route
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
