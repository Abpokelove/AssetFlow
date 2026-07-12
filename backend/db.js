const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "assetflow_db",
  user: process.env.DB_USER || "assetflow",
  password: process.env.DB_PASSWORD,
  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false }
      : false,
});

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error);
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function testConnection() {
  const result = await pool.query(`
    SELECT
      current_database() AS database,
      current_user AS username,
      CURRENT_TIMESTAMP AS connected_at
  `);

  return result.rows[0];
}

module.exports = {
  pool,
  query,
  testConnection,
};