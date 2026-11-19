/*
  Name: Maria Reynoso
  Date: 11/19/2026
  CSC 372-01

  Database connection for PostgreSQL using Neon.
*/

const { Pool } = require('pg');
require('dotenv').config();

let pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;