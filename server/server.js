// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { serviceAccount } = require('./firebase-config');
const { requireAuth, requireAdmin, requireStudent } = require('./middleware/authMiddleware');
const upload = require('./config/multerConfig');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitizeHtml = require('sanitize-html');
// Use mock service for testing (replace with real service when valid API key is available)
const { enhanceItemDescription, categorizeAndTagDoubt, summarizeOpportunity } = require('./services/geminiService.mock');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Security middleware
app.use(helmet());

// Input sanitization middleware
app.use((req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {}
        });
      }
    }
  }
  next();
});

// Validation schemas using Zod
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const itemSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(3),
  condition: z.string().min(3),
  price: z.string().regex(/^\d+\.?\d*$/),
  image_path: z.string().url().optional()
});

const doubtSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  topic: z.string().min(3),
  isAnonymous: z.boolean().optional()
});

const replySchema = z.object({
  content: z.string().min(3)
});

const opportunitySchema = z.object({
  title: z.string().min(3),
  type: z.string().min(3),
  mode: z.string().min(3),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  teamSize: z.number().int().positive(),
  skills: z.array(z.string().min(1))
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Neon Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_4XQy6GLnjizW@ep-tiny-wind-a12i9n5h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false,
  },
});

// Verify database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Read allowed emails and passwords from the CSV file
const allowedUsers = [];
const csvFilePath = path.join(__dirname, 'deepseek_csv_20260104_fc90f2.txt');
const csvData = fs.readFileSync(csvFilePath, 'utf-8');
const lines = csvData.split('\n');

// Parse CSV data (skip header line)
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line) {
    const [name, email, password] = line.split(',');
    if (email && password) {
      allowedUsers.push({ email, password });
    }
  }
}

// Add admin user to allowed list
allowedUsers.push({ email: 'admin_comp_2024@ltce.in', password: 'Password@123' });

// Add demo user to allowed list
allowedUsers.push({ email: 'demo_student@ltce.in', password: 'DemoPassword@123' });

// Login endpoint
app.post('/api/login', async (req, res) => {
  console.log('Request body:', req.body);
  
  try {
    // Validate request body
    const { email, password } = loginSchema.parse(req.body);
    
    // Check if the email and password are in the allowed list
    const isAllowed = allowedUsers.some(user => user.email === email && user.password === password);
    
    if (!isAllowed) {
      return res.status(401).json({ error: 'Unauthorized: Email or password is incorrect.' });
    }
    
    // Create a custom token for the user
    const customToken = await admin.auth().createCustomToken(email);
      
    // Store user data in the Neon database
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING *',
      [email, password]
    );
      
    console.log('User inserted/updated:', result.rows);
  
    res.json({ token: customToken });
  } catch (error) {
    console.error('Error in login:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test endpoint for authenticated users
app.get('/api/auth-test', requireAuth, (req, res) => {
  res.json({ message: 'Authenticated successfully', user: req.user });
});

// Test endpoint for admin users
app.get('/api/admin-test', requireAdmin, (req, res) => {
  res.json({ message: 'Admin access granted', user: req.user });
});

// Test endpoint for student users
app.get('/api/student-test', requireStudent, (req, res) => {
  res.json({ message: 'Student access granted', user: req.user });
});

// Image upload endpoint
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});

// Marketplace APIs

// POST /items - upload item (status = pending)
app.post('/api/items', requireAuth, async (req, res) => {
  try {
    const { title, description, category, condition, price, image_path } = req.body;
    const userEmail = req.user.email; // Get user email from the authenticated user
    
    console.log('Looking for user with email:', userEmail);
    
    // Find the user ID from the database based on email
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
      
    console.log('User query result:', userResult.rows);
      
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
      
    const userId = userResult.rows[0].id;
    
    // Use Gemini to enhance the item description
    const enhancedDescription = await enhanceItemDescription(description, title, category);
    
    console.log('Original description:', description);
    console.log('Enhanced description:', enhancedDescription);
    
    // Insert item into database with status = 'pending' and enhanced description
    const result = await pool.query(
      'INSERT INTO items (title, description, category, condition, price, image_path, status, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, enhancedDescription, category, condition, price, image_path, 'pending', userId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /items/my - user's own items
app.get('/api/items/my', requireAuth, async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    // Find the user ID from the database based on email
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    
    const result = await pool.query('SELECT * FROM items WHERE user_id = $1', [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /items/:id - delete own item (before approval)
app.delete('/api/items/:id', requireAuth, async (req, res) => {
  try {
    const itemId = req.params.id;
    const userEmail = req.user.email;
    
    // Find the user ID from the database based on email
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    
    // Check if the item belongs to the user and is not approved yet
    const itemResult = await pool.query('SELECT * FROM items WHERE id = $1 AND user_id = $2', [itemId, userId]);
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found or not owned by you' });
    }
    
    if (itemResult.rows[0].status === 'approved') {
      return res.status(400).json({ error: 'Cannot delete approved items' });
    }
    
    // Delete the item
    await pool.query('DELETE FROM items WHERE id = $1', [itemId]);
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /items - approved items only (public)
app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items WHERE status = 'approved'");
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching approved items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /items/:id - get single item
app.get('/api/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    
    const result = await pool.query('SELECT * FROM items WHERE id = $1', [itemId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin Approval Flow

// GET /admin/items/pending - get all pending items (admin only)
app.get('/api/admin/items/pending', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items WHERE status = 'pending'");
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/doubts/pending - get all pending doubts (admin only)
app.get('/api/admin/doubts/pending', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM doubts WHERE status = 'pending'");
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending doubts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/opportunities/pending - get all pending opportunities (admin only)
app.get('/api/admin/opportunities/pending', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM opportunities WHERE status = 'pending'");
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending opportunities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/items/:id/approve - approve an item (admin only)
app.post('/api/admin/items/:id/approve', requireAdmin, async (req, res) => {
  try {
    const itemId = req.params.id;
    const { adminRemark } = req.body;
    
    // Update item status to approved and add admin remark
    const result = await pool.query(
      'UPDATE items SET status = $1, admin_remark = $2 WHERE id = $3 RETURNING *',
      ['approved', adminRemark || '', itemId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Create notification for the user
    const item = result.rows[0];
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [item.user_id, `Your item "${item.title}" has been approved by admin`]
    );
    
    res.json({ message: 'Item approved successfully', item: result.rows[0] });
  } catch (error) {
    console.error('Error approving item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/items/:id/reject - reject an item (admin only)
app.post('/api/admin/items/:id/reject', requireAdmin, async (req, res) => {
  try {
    const itemId = req.params.id;
    const { adminRemark } = req.body;
    
    // Update item status to rejected and add admin remark
    const result = await pool.query(
      'UPDATE items SET status = $1, admin_remark = $2 WHERE id = $3 RETURNING *',
      ['rejected', adminRemark || 'No reason provided', itemId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Create notification for the user
    const item = result.rows[0];
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [item.user_id, `Your item "${item.title}" has been rejected by admin: ${adminRemark || 'No reason provided'}`]
    );
    
    res.json({ message: 'Item rejected successfully', item: result.rows[0] });
  } catch (error) {
    console.error('Error rejecting item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/doubts/:id/approve - approve a doubt (admin only)
app.post('/api/admin/doubts/:id/approve', requireAdmin, async (req, res) => {
  try {
    const doubtId = req.params.id;
    const { adminRemark } = req.body;
    
    // Update doubt status to approved and add admin remark
    const result = await pool.query(
      'UPDATE doubts SET status = $1, admin_remark = $2 WHERE id = $3 RETURNING *',
      ['approved', adminRemark || '', doubtId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doubt not found' });
    }
    
    // Create notification for the user
    const doubt = result.rows[0];
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [doubt.user_id, `Your doubt "${doubt.title}" has been approved by admin`]
    );
    
    res.json({ message: 'Doubt approved successfully', doubt: result.rows[0] });
  } catch (error) {
    console.error('Error approving doubt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/doubts/:id/reject - reject a doubt (admin only)
app.post('/api/admin/doubts/:id/reject', requireAdmin, async (req, res) => {
  try {
    const doubtId = req.params.id;
    const { adminRemark } = req.body;
    
    // Update doubt status to rejected and add admin remark
    const result = await pool.query(
      'UPDATE doubts SET status = $1, admin_remark = $2 WHERE id = $3 RETURNING *',
      ['rejected', adminRemark || 'No reason provided', doubtId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doubt not found' });
    }
    
    // Create notification for the user
    const doubt = result.rows[0];
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [doubt.user_id, `Your doubt "${doubt.title}" has been rejected by admin: ${adminRemark || 'No reason provided'}`]
    );
    
    res.json({ message: 'Doubt rejected successfully', doubt: result.rows[0] });
  } catch (error) {
    console.error('Error rejecting doubt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/opportunities/:id/approve - approve an opportunity (admin only)
app.post('/api/admin/opportunities/:id/approve', requireAdmin, async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const { adminRemark } = req.body;
    
    // Update opportunity status to approved and add admin remark
    const result = await pool.query(
      'UPDATE opportunities SET status = $1, admin_remark = $2 WHERE id = $3 RETURNING *',
      ['approved', adminRemark || '', opportunityId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    // Create notification for the user
    const opportunity = result.rows[0];
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [opportunity.posted_by, `Your opportunity "${opportunity.title}" has been approved by admin`]
    );
    
    res.json({ message: 'Opportunity approved successfully', opportunity: result.rows[0] });
  } catch (error) {
    console.error('Error approving opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/opportunities/:id/reject - reject an opportunity (admin only)
app.post('/api/admin/opportunities/:id/reject', requireAdmin, async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const { adminRemark } = req.body;
    
    // Update opportunity status to rejected and add admin remark
    const result = await pool.query(
      'UPDATE opportunities SET status = $1, admin_remark = $2 WHERE id = $3 RETURNING *',
      ['rejected', adminRemark || 'No reason provided', opportunityId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    // Create notification for the user
    const opportunity = result.rows[0];
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [opportunity.posted_by, `Your opportunity "${opportunity.title}" has been rejected by admin: ${adminRemark || 'No reason provided'}`]
    );
    
    res.json({ message: 'Opportunity rejected successfully', opportunity: result.rows[0] });
  } catch (error) {
    console.error('Error rejecting opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Community / Doubt System APIs

// POST /doubts - post a doubt
app.post('/api/doubts', requireAuth, async (req, res) => {
  try {
    const { title, content, topic, isAnonymous } = req.body;
    const userEmail = req.user.email;
    
    // Find the user ID from the database based on email
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    
    // Use Gemini to categorize and tag the doubt
    const { category, tags } = await categorizeAndTagDoubt(title, content);
    
    console.log('AI Categorization - Category:', category, 'Tags:', tags);
    
    // Insert doubt into database with status = 'pending' and AI-generated category/tags
    const result = await pool.query(
      'INSERT INTO doubts (title, content, topic, is_anonymous, status, user_id, ai_category, ai_tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, content, topic, isAnonymous || false, 'pending', userId, category, tags]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating doubt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /doubts - get all doubts
app.get('/api/doubts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM doubts ORDER BY created_at DESC');
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching doubts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /doubts/:id/reply - reply to a doubt
app.post('/api/doubts/:id/reply', requireAuth, async (req, res) => {
  try {
    const doubtId = req.params.id;
    const { content } = req.body;
    const userEmail = req.user.email;
    
    // Find the user ID from the database based on email
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    
    // Insert reply into database
    const result = await pool.query(
      'INSERT INTO replies (content, doubt_id, user_id) VALUES ($1, $2, $3) RETURNING *',
      [content, doubtId, userId]
    );
    
    // Create notification for the doubt owner
    const doubtResult = await pool.query('SELECT user_id FROM doubts WHERE id = $1', [doubtId]);
    
    if (doubtResult.rows.length > 0 && doubtResult.rows[0].user_id !== userId) {
      await pool.query(
        'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
        [doubtResult.rows[0].user_id, `Someone replied to your doubt: "${content}"`]
      );
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /doubts/:id - get single doubt with replies
app.get('/api/doubts/:id', async (req, res) => {
  try {
    const doubtId = req.params.id;
    
    // Get the doubt
    const doubtResult = await pool.query('SELECT * FROM doubts WHERE id = $1', [doubtId]);
    
    if (doubtResult.rows.length === 0) {
      return res.status(404).json({ error: 'Doubt not found' });
    }
    
    // Get the replies
    const repliesResult = await pool.query('SELECT * FROM replies WHERE doubt_id = $1 ORDER BY created_at ASC', [doubtId]);
    
    const doubt = doubtResult.rows[0];
    doubt.replies = repliesResult.rows;
    
    res.json(doubt);
  } catch (error) {
    console.error('Error fetching doubt:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Opportunities & Team Finder APIs

// POST /opportunities - post an opportunity (senior/admin only)
app.post('/api/opportunities', requireAuth, async (req, res) => {
  try {
    const { title, type, mode, deadline, teamSize, skills, description, prize, location, image_path } = req.body;
    const userEmail = req.user.email;

    // Find the user ID and role from the database based on email
    const userResult = await pool.query('SELECT id, role FROM users WHERE email = $1', [userEmail]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRole = userResult.rows[0].role;

    // Check if user is senior or admin
    if (userRole !== 'senior' && userRole !== 'admin') {
      return res.status(403).json({ error: 'Only seniors and admins can post opportunities' });
    }

    const userId = userResult.rows[0].id;

    // Use Gemini to summarize the opportunity - only send required fields
    const opportunityData = { title, deadline, skills, teamSize: teamSize || 1, mode };
    const aiSummary = await summarizeOpportunity(opportunityData);

    console.log('AI Summary:', aiSummary);

    // Insert opportunity into database with status = 'pending' and AI-generated summary
    const result = await pool.query(
      'INSERT INTO opportunities (title, type, mode, deadline, team_size, skills, description, prize, location, image_path, status, posted_by, ai_summary) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [title, type, mode, deadline, teamSize, skills, description, prize, location, image_path, 'pending', userId, aiSummary]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Error response:', error.response);
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// GET /opportunities - get all opportunities with optional filtering
app.get('/api/opportunities', async (req, res) => {
  try {
    const { type, mode } = req.query;
    let query = 'SELECT * FROM opportunities WHERE 1=1';
    const params = [];
    
    if (type) {
      query += ' AND type = $' + (params.length + 1);
      params.push(type);
    }
    
    if (mode) {
      query += ' AND mode = $' + (params.length + 1);
      params.push(mode);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /opportunities/:id - get single opportunity
app.get('/api/opportunities/:id', async (req, res) => {
  try {
    const opportunityId = req.params.id;
    
    const result = await pool.query('SELECT * FROM opportunities WHERE id = $1', [opportunityId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notifications APIs

// GET /notifications - get user's notifications
app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    // Find the user ID from the database based on email
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    
    // Get notifications for the user
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /notifications/mark-read - mark notification as read
app.post('/api/notifications/mark-read', requireAuth, async (req, res) => {
  try {
    const { notificationId } = req.body;
    const userEmail = req.user.email;
    
    // Find the user ID from the database based on email
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    
    // Check if notification belongs to user
    const notificationResult = await pool.query('SELECT * FROM notifications WHERE id = $1 AND user_id = $2', [notificationId, userId]);
    
    if (notificationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found or not owned by you' });
    }
    
    // Mark notification as read
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [notificationId]);
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Profile APIs

// GET /users/me - get current user profile
app.get('/api/users/me', requireAuth, async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    // Find the user from the database based on email
    const userResult = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/:id/activity - get user activity
app.get('/api/users/:id/activity', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get items posted by user
    const itemsResult = await pool.query('SELECT * FROM items WHERE user_id = $1', [userId]);
    
    // Get doubts asked by user
    const doubtsResult = await pool.query('SELECT * FROM doubts WHERE user_id = $1', [userId]);
    
    // Get replies given by user
    const repliesResult = await pool.query('SELECT * FROM replies WHERE user_id = $1', [userId]);
    
    res.json({
      items: itemsResult.rows,
      doubts: doubtsResult.rows,
      replies: repliesResult.rows
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Signup endpoint (only for allowed emails)
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  // Check if the email is in the allowed list
  const isAllowed = allowedUsers.some(user => user.email === email);

  if (!isAllowed) {
    return res.status(401).json({ error: 'Unauthorized: Email is not allowed to sign up.' });
  }

  try {
    // Create a user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Store user data in the Neon database
    await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
      [email, password]
    );

    res.json({ uid: userRecord.uid });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});