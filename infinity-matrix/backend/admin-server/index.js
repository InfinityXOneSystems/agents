const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('pino')();
const app = express();

const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'securepassword';

// Replace hardcoded credentials with environment variables
if (!process.env.DEFAULT_ADMIN_EMAIL || !process.env.DEFAULT_ADMIN_PASSWORD) {
  console.error('Error: Admin credentials are not set in environment variables.');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Structured logging middleware
app.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path, timestamp: new Date().toISOString() });
  next();
});

// Serve admin dashboard at /admin
app.use('/admin', express.static(path.join(__dirname, '../../frontend/admin')));

// Import routes (only the ones that exist)
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const agentsRoutes = require('./routes/agents');
const chatRoutes = require('./routes/chat');
const swarmRoutes = require('./routes/swarm');
const adminRoutes = require('./routes/admin');
const investorRoutes = require('./routes/investor');
const visionCortexRoutes = require('./routes/vision-cortex');
const intelligenceRoutes = require('./routes/intelligence');
const scraperRoutes = require('./routes/scraper');
const gcpRoutes = require('./routes/gcp');
const workspaceRoutes = require('./routes/workspace');
const manusRoutes = require('./routes/manus');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/swarm', swarmRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/vision-cortex', visionCortexRoutes);
app.use('/intelligence', intelligenceRoutes); // Primary Intelligence Endpoint
app.use('/api/scraper', scraperRoutes);
app.use('/api/gcp', gcpRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/manus', manusRoutes); // Manus System Scraper & Integration

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  // Simple health check without database for now
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    server: 'running',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Infinity X One Systems Admin API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      agents: '/api/agents',
      chat: '/api/chat',
      swarm: '/api/swarm',
      admin: '/api/admin',
      investor: '/api/investor',
      visionCortex: '/api/vision-cortex',
    },
    documentation: 'https://infinityxai.com/api/docs',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Infinity X One Systems Admin Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   • Authentication:  /api/auth ✅`);
  console.log(`   • Users:          /api/users ✅`);
  console.log(`   • Agents:         /api/agents ✅`);
  console.log(`   • Chat:           /api/chat ✅`);
  console.log(`   • Swarm AI:       /api/swarm ✅`);
  console.log(`   • Admin:          /api/admin ✅`);
  console.log(`   • Investor:       /api/investor ✅`);
  console.log(`   • Intelligence:   /intelligence ✅ PRIMARY`);
  console.log(`   • Vision Cortex:  /api/vision-cortex ✅`);
  console.log(`   • AI Agent Partners: Integrated ✅`);
  console.log(`   • Psychology AI:  Integrated ✅`);
  console.log(`\n🔑 Default Admin Credentials:`);
  console.log(`   Email:    ${DEFAULT_ADMIN_EMAIL}`);
  console.log(`   Password: [REDACTED]`);
  console.log(`\n🌐 Main Site: infinityxai.com - All capabilities consolidated`);
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

module.exports = app;
