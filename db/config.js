const pgp = require("pg-promise")();

const connection = {
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
};

const db = pgp(connection);

module.exports = db;
