const { Pool } = require("pg");

// Creating a new instance of Pool with database connection configuration
const pool = new Pool({
  user: "labber",
  password: "labber",
  host: "localhost",
  database: "lightbnb",
});

// Defining a query function to execute SQL queries
const query = (text, params, callback) => {
  // Delegating the query execution to the pool object
  return pool.query(text, params, callback);
};

module.exports = { query };