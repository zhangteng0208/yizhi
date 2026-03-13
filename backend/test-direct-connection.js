const { Pool } = require('pg');

const pool = new Pool({
  host: '69.5.20.41',
  port: 5432,
  database: 'yizhi',
  user: 'yizhi',
  password: 'Yz2026xiansheng!',
  connectionTimeoutMillis: 5000,
});

async function test() {
  try {
    console.log('Connecting...');
    const start = Date.now();
    const client = await pool.connect();
    console.log(`Connected in ${Date.now() - start}ms`);
    
    const result = await client.query('SELECT count(*) FROM users');
    console.log('Users count:', result.rows[0].count);
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
