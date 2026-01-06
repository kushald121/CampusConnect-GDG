const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Initialize Neon Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4XQy6GLnjizW@ep-tiny-wind-a12i9n5h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

// Read the schema file
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

// Execute the schema
pool.query(schemaSQL, (err, res) => {
  if (err) {
    console.error('Error executing schema:', err);
  } else {
    console.log('Schema executed successfully');
  }
  pool.end();
});