const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
  console.log('[BinmarDrive DB Setup] Connecting to MySQL...');
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306', 10)
    });

    console.log('[BinmarDrive DB Setup] Connected to MySQL server.');
    const dbName = process.env.DB_NAME || 'binmardrive_db';

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`[BinmarDrive DB Setup] Database '${dbName}' created or already exists.`);

    await conn.changeUser({ database: dbName });

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        await conn.query(stmt);
      } catch (e) {
        // Table or constraint already exists
      }
    }

    console.log('[BinmarDrive DB Setup] Schema & initial seed data successfully loaded!');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('[BinmarDrive DB Setup] Error running MySQL setup:', err.message);
    console.error('Make sure your MySQL server (e.g. XAMPP or MySQL Service) is running and check your .env settings.');
    process.exit(1);
  }
}

run();
