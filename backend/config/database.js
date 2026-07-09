const { Pool } = require('pg');
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = require('./env');

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

pool.on('connect', () => {
  console.log(' Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error(' Unexpected database error:', err);
});

module.exports = pool;