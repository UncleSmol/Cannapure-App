require("dotenv").config();
const express = require("express");
const compression = require("compression");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Configure compression
app.use(
	
		pression({,
			
level: process.env.COMPRESSION_LEVEL || 6,
	})
);

// Serve static files
app.use(express.static(__dirname));
""
	asic route""
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

	tart server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
