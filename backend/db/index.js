const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "password",
  database: process.env.PGDATABASE || "assetflow",
  port: parseInt(process.env.PGPORT || "5432", 10),
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
