const { Pool } = require('pg');
const admin = require('firebase-admin');
const { serviceAccount } = require('./firebase-config');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4XQy6GLnjizW@ep-tiny-wind-a12i9n5h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function addAdminUser() {
  try {
    const email = 'admin_comp_2024@ltce.in';
    const password = 'Password@123';
    
    // Create user in Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    
    console.log('Firebase user created:', userRecord.uid);
    
    // Add user to PostgreSQL database
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['Admin User', email, password, 'admin']
    );
    
    console.log('Admin user added to database');
    pool.end();
  } catch (error) {
    console.error('Error adding admin user:', error);
    pool.end();
  }
}

addAdminUser();