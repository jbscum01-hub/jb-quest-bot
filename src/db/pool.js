const { Pool } = require('pg');
const { CONFIG } = require('../config');

const pool = new Pool({
  connectionString: CONFIG.database.url,
  ssl: CONFIG.database.url ? { rejectUnauthorized: false } : false,
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
};
