const { Pool } = require('pg');

// Initialize Neon Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4XQy6GLnjizW@ep-tiny-wind-a12i9n5h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to existing tables...');

    // Check if status column exists in doubts table
    const doubtsStatusCheck = await pool.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'doubts' AND column_name = 'status'`
    );

    if (doubtsStatusCheck.rows.length === 0) {
      console.log('📝 Adding status column to doubts table...');
      await pool.query('ALTER TABLE doubts ADD COLUMN status VARCHAR(20) DEFAULT \'pending\'');
      await pool.query("ALTER TABLE doubts ADD CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected'))");
      console.log('✅ Added status column to doubts table');
    }

    // Check if admin_remark column exists in doubts table
    const doubtsRemarkCheck = await pool.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'doubts' AND column_name = 'admin_remark'`
    );

    if (doubtsRemarkCheck.rows.length === 0) {
      console.log('📝 Adding admin_remark column to doubts table...');
      await pool.query('ALTER TABLE doubts ADD COLUMN admin_remark TEXT');
      console.log('✅ Added admin_remark column to doubts table');
    }

    // Check if status column exists in opportunities table
    const opportunitiesStatusCheck = await pool.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'opportunities' AND column_name = 'status'`
    );

    if (opportunitiesStatusCheck.rows.length === 0) {
      console.log('📝 Adding status column to opportunities table...');
      await pool.query('ALTER TABLE opportunities ADD COLUMN status VARCHAR(20) DEFAULT \'pending\'');
      await pool.query("ALTER TABLE opportunities ADD CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected'))");
      console.log('✅ Added status column to opportunities table');
    }

    // Check if admin_remark column exists in opportunities table
    const opportunitiesRemarkCheck = await pool.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'opportunities' AND column_name = 'admin_remark'`
    );

    if (opportunitiesRemarkCheck.rows.length === 0) {
      console.log('📝 Adding admin_remark column to opportunities table...');
      await pool.query('ALTER TABLE opportunities ADD COLUMN admin_remark TEXT');
      console.log('✅ Added admin_remark column to opportunities table');
    }

    // Update existing records to have pending status
    console.log('📝 Updating existing records to pending status...');
    await pool.query("UPDATE doubts SET status = 'pending' WHERE status IS NULL");
    await pool.query("UPDATE opportunities SET status = 'pending' WHERE status IS NULL");
    console.log('✅ Updated existing records');

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
addMissingColumns();