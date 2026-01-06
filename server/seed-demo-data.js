const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Initialize Neon Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4XQy6GLnjizW@ep-tiny-wind-a12i9n5h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

async function seedDemoData() {
  try {
    console.log('Starting demo data seeding...');
    
    // Clear existing data (except admin user)
    await pool.query('DELETE FROM notifications');
    await pool.query('DELETE FROM replies');
    await pool.query('DELETE FROM doubts');
    await pool.query('DELETE FROM opportunities');
    await pool.query('DELETE FROM items');
    await pool.query("DELETE FROM users WHERE email NOT LIKE '%admin%'");
    
    console.log('Existing data cleared (except admin)');
    
    // Seed 1 admin (already exists, but let's ensure it's there)
    const adminPassword = await bcrypt.hash('Password@123', 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['Admin User', 'admin_comp_2024@ltce.in', adminPassword, 'admin']
    );
    console.log('Admin user ensured');
    
    // Seed 2 seniors
    const senior1Password = await bcrypt.hash('Password@123', 10);
    const senior2Password = await bcrypt.hash('Password@123', 10);
    
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['Senior User 1', 'senior1_comp_2024@ltce.in', senior1Password, 'senior']
    );
    
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['Senior User 2', 'senior2_comp_2024@ltce.in', senior2Password, 'senior']
    );
    console.log('Senior users seeded');
    
    // Seed 3 students
    const student1Password = await bcrypt.hash('Password@123', 10);
    const student2Password = await bcrypt.hash('Password@123', 10);
    const student3Password = await bcrypt.hash('Password@123', 10);
    
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['Student User 1', 'student1_comp_2024@ltce.in', student1Password, 'student']
    );
    
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['Student User 2', 'student2_comp_2024@ltce.in', student2Password, 'student']
    );
    
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['Student User 3', 'student3_comp_2024@ltce.in', student3Password, 'student']
    );
    console.log('Student users seeded');
    
    // Get user IDs
    const adminResult = await pool.query('SELECT id FROM users WHERE email = $1', ['admin_comp_2024@ltce.in']);
    const adminId = adminResult.rows[0].id;
    
    const senior1Result = await pool.query('SELECT id FROM users WHERE email = $1', ['senior1_comp_2024@ltce.in']);
    const senior1Id = senior1Result.rows[0].id;
    
    const senior2Result = await pool.query('SELECT id FROM users WHERE email = $1', ['senior2_comp_2024@ltce.in']);
    const senior2Id = senior2Result.rows[0].id;
    
    const student1Result = await pool.query('SELECT id FROM users WHERE email = $1', ['student1_comp_2024@ltce.in']);
    const student1Id = student1Result.rows[0].id;
    
    const student2Result = await pool.query('SELECT id FROM users WHERE email = $1', ['student2_comp_2024@ltce.in']);
    const student2Id = student2Result.rows[0].id;
    
    const student3Result = await pool.query('SELECT id FROM users WHERE email = $1', ['student3_comp_2024@ltce.in']);
    const student3Id = student3Result.rows[0].id;
    
    // Seed 5 items
    const items = [
      {
        title: 'Laptop for Sale',
        description: 'Gently used laptop in excellent condition',
        category: 'Electronics',
        condition: 'Like New',
        price: '599.99',
        image_path: '/uploads/laptop.jpg',
        status: 'approved',
        user_id: student1Id
      },
      {
        title: 'Textbook - Computer Science',
        description: 'Computer Science textbook for semester 3',
        category: 'Books',
        condition: 'Good',
        price: '49.99',
        image_path: '/uploads/textbook.jpg',
        status: 'approved',
        user_id: student2Id
      },
      {
        title: 'Wireless Headphones',
        description: 'Noise-cancelling wireless headphones',
        category: 'Electronics',
        condition: 'Excellent',
        price: '129.99',
        image_path: '/uploads/headphones.jpg',
        status: 'pending',
        user_id: student3Id
      },
      {
        title: 'Bicycle',
        description: 'Mountain bike in good condition',
        category: 'Sports',
        condition: 'Good',
        price: '249.99',
        image_path: '/uploads/bicycle.jpg',
        status: 'approved',
        user_id: student1Id
      },
      {
        title: 'Calculator',
        description: 'Scientific calculator for engineering students',
        category: 'Stationery',
        condition: 'New',
        price: '29.99',
        image_path: '/uploads/calculator.jpg',
        status: 'approved',
        user_id: student2Id
      }
    ];
    
    for (const item of items) {
      await pool.query(
        'INSERT INTO items (title, description, category, condition, price, image_path, status, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [item.title, item.description, item.category, item.condition, item.price, item.image_path, item.status, item.user_id]
      );
    }
    console.log('Items seeded');
    
    // Seed 3 doubts
    const doubts = [
      {
        title: 'Programming Help Needed',
        content: 'I need help with my Java programming assignment. Can someone explain inheritance?',
        topic: 'Programming',
        is_anonymous: false,
        user_id: student1Id
      },
      {
        title: 'Project Team Needed',
        content: 'Looking for team members for our final year project on AI. Need 2 more members.',
        topic: 'Projects',
        is_anonymous: false,
        user_id: student2Id
      },
      {
        title: 'Exam Preparation',
        content: 'What are the best resources to prepare for the upcoming Data Structures exam?',
        topic: 'Academics',
        is_anonymous: true,
        user_id: student3Id
      }
    ];
    
    for (const doubt of doubts) {
      await pool.query(
        'INSERT INTO doubts (title, content, topic, is_anonymous, user_id) VALUES ($1, $2, $3, $4, $5)',
        [doubt.title, doubt.content, doubt.topic, doubt.is_anonymous, doubt.user_id]
      );
    }
    console.log('Doubts seeded');
    
    // Seed replies to doubts
    const doubt1Result = await pool.query('SELECT id FROM doubts WHERE title = $1', ['Programming Help Needed']);
    const doubt1Id = doubt1Result.rows[0].id;
    
    const doubt2Result = await pool.query('SELECT id FROM doubts WHERE title = $1', ['Project Team Needed']);
    const doubt2Id = doubt2Result.rows[0].id;
    
    const replies = [
      {
        content: 'I can help with Java inheritance. Let me know when you are free.',
        doubt_id: doubt1Id,
        user_id: senior1Id
      },
      {
        content: 'I am interested in joining your AI project team. Let us discuss.',
        doubt_id: doubt2Id,
        user_id: student3Id
      },
      {
        content: 'Check out the official Java documentation. It has good examples.',
        doubt_id: doubt1Id,
        user_id: senior2Id
      }
    ];
    
    for (const reply of replies) {
      await pool.query(
        'INSERT INTO replies (content, doubt_id, user_id) VALUES ($1, $2, $3)',
        [reply.content, reply.doubt_id, reply.user_id]
      );
    }
    console.log('Replies seeded');
    
    // Seed 2 opportunities
    const opportunities = [
      {
        title: 'Hackathon 2026',
        type: 'competition',
        mode: 'online',
        deadline: '2026-12-31',
        team_size: 4,
        skills: ['JavaScript', 'Node.js', 'React'],
        posted_by: senior1Id
      },
      {
        title: 'Research Assistant Needed',
        type: 'job',
        mode: 'offline',
        deadline: '2026-11-30',
        team_size: 1,
        skills: ['Python', 'Machine Learning', 'Data Analysis'],
        posted_by: senior2Id
      }
    ];
    
    for (const opportunity of opportunities) {
      await pool.query(
        'INSERT INTO opportunities (title, type, mode, deadline, team_size, skills, posted_by) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [opportunity.title, opportunity.type, opportunity.mode, opportunity.deadline, opportunity.team_size, opportunity.skills, opportunity.posted_by]
      );
    }
    console.log('Opportunities seeded');
    
    // Seed some notifications
    const notifications = [
      {
        user_id: student1Id,
        message: 'Your item "Laptop for Sale" has been approved by admin'
      },
      {
        user_id: student2Id,
        message: 'Your item "Textbook - Computer Science" has been approved by admin'
      },
      {
        user_id: student1Id,
        message: 'Someone replied to your doubt: "Programming Help Needed"'
      },
      {
        user_id: student2Id,
        message: 'Someone replied to your doubt: "Project Team Needed"'
      }
    ];
    
    for (const notification of notifications) {
      await pool.query(
        'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
        [notification.user_id, notification.message]
      );
    }
    console.log('Notifications seeded');
    
    console.log('\n✅ Demo data seeding completed successfully!');
    console.log('\nSeeded data:');
    console.log('- 1 admin user');
    console.log('- 2 senior users');
    console.log('- 3 student users');
    console.log('- 5 items (3 approved, 1 pending)');
    console.log('- 3 doubts');
    console.log('- 3 replies');
    console.log('- 2 opportunities');
    console.log('- 4 notifications');
    
  } catch (error) {
    console.error('Error seeding demo data:', error);
  } finally {
    await pool.end();
  }
}

seedDemoData();