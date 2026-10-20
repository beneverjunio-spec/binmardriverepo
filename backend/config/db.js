require('dotenv').config();
const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER || 'binmar_user',
  password: process.env.DB_PASSWORD || 'Binmar@2026!',
  server: process.env.DB_SERVER || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_NAME || 'binmar_rent_car',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(dbConfig);
    console.log('[MSSQL] Connected to binmar_rent_car database on 127.0.0.1:1433');
  }
  return pool;
}

module.exports = {
  sql,
  getPool
};
