const { Pool } = require('pg');

const pool = new Pool({
  host: '69.5.20.41',
  port: 5432,
  database: 'yizhi',
  user: 'yizhi',
  password: 'Yz2026xiansheng!',
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('✓ Connected successfully');

    const result = await client.query('SELECT NOW()');
    console.log('✓ Query executed:', result.rows[0]);

    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('✓ Tables in database:', tables.rows.map(r => r.table_name));

    client.release();
    await pool.end();
    console.log('✓ Connection closed');
  } catch (error) {
    console.error('✗ Database error:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

testConnection();
