const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'infinity-xone-secret-key-change-in-production';

// In-memory user store (replace with database in production)
const users = [
  {
    id: '1',
    email: 'admin@infinityxai.com',
    password: 'admin', // In production, use bcrypt
    role: 'admin',
    name: 'Admin User'
  }
];

// Enhanced authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      const errorMessage = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
      return res.status(403).json({ error: errorMessage });
    }
    req.user = user;
    next();
  });
}

// Role-based middleware
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `Access denied. ${role} role required` });
    }
    next();
  };
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required' });
  }
  next();
}

// Investor or admin middleware
function requireInvestor(req, res, next) {
  if (!req.user || (req.user.role !== 'investor' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Access denied. Investor or admin role required' });
  }
  next();
}

// POST /login - User login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  });
});

// POST /login - User login (alternative)
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Replace with real user validation
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// POST /register - User registration
router.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    email,
    password, // In production, use bcrypt
    role: 'user',
    name: name || email
  };

  users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    }
  });
});

// GET /me - Get current user
router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  });
});

// POST /logout - User logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Add missing GET endpoint for '/api/auth'
router.get('/api/auth', (req, res) => {
  res.json({
    success: true,
    message: 'Auth endpoint is active',
  });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.requireRole = requireRole;
module.exports.requireAdmin = requireAdmin;
module.exports.requireInvestor = requireInvestor;
module.exports.JWT_SECRET = JWT_SECRET;
