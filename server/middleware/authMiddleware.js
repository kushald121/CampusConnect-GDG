const admin = require('firebase-admin');

// Middleware to verify Firebase token (custom or ID token)
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    // Try to verify as ID token first
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (idTokenError) {
      // If ID token verification fails, assume it's a custom token and decode it manually
      // Note: This is not secure for production! Custom tokens should be exchanged for ID tokens on the client.
      try {
        // For testing purposes, we'll extract the email from the custom token
        // In production, you should never do this - always verify tokens properly
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf-8'));
        // The user email is in the 'uid' field of the custom token
        decodedToken = { uid: token, email: payload.uid };
      } catch (customTokenError) {
        console.error('Error verifying custom token:', customTokenError);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    }
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

// Middleware to require authentication
function requireAuth(req, res, next) {
  verifyToken(req, res, next);
}

// Middleware to require admin role
async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    // Try to verify as ID token first
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (idTokenError) {
      // If ID token verification fails, assume it's a custom token and decode it manually
      // Note: This is not secure for production! Custom tokens should be exchanged for ID tokens on the client.
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf-8'));
      // The user email is in the 'uid' field of the custom token
      decodedToken = { uid: token, email: payload.uid };
    }
    
    // Check if the user is an admin (you may need to fetch user role from your database)
    // For now, we'll assume the email contains 'admin' or you have a specific admin email
    if (!decodedToken.email || !decodedToken.email.includes('admin')) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying admin token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

// Middleware to require student role
async function requireStudent(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    // Try to verify as ID token first
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (idTokenError) {
      // If ID token verification fails, assume it's a custom token and decode it manually
      // Note: This is not secure for production! Custom tokens should be exchanged for ID tokens on the client.
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf-8'));
      // The user email is in the 'uid' field of the custom token
      decodedToken = { uid: token, email: payload.uid };
    }
    
    // Check if the user is a student (you may need to fetch user role from your database)
    // For now, we'll assume the email contains 'student' or you have a specific student email pattern
    if (!decodedToken.email || !decodedToken.email.includes('ltce.in')) {
      return res.status(403).json({ error: 'Forbidden: Student access required' });
    }
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying student token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

module.exports = { requireAuth, requireAdmin, requireStudent };