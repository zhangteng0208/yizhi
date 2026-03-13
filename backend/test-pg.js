const { Pool } = require('pg');

const pool = new Pool({
  host: '69.5.20.41',
  port: 5432,
  database: 'yizhi',
  user: 'yizhi',
  password: 'Yz2026xiansheng!',
  connectionTimeoutMillis: 5000,
});

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection...');
    const client = await pool.connect();
    console.log('✅ Connected to database');

    const result = await client.query('SELECT 1 as test');
    console.log('✅ Query successful:', result.rows);

    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
