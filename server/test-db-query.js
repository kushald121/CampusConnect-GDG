const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4XQy6GLnjizW@ep-tiny-wind-a12i9n5h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testQuery() {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', ['anshiksigh_comp_2024@ltce.in']);
    console.log('User query result:', result.rows);
    pool.end();
  } catch (error) {
    console.error('Error querying database:', error);
    pool.end();
  }
}

testQuery();