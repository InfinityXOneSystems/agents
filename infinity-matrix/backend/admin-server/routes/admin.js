const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const crypto = require('crypto');

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// In-memory stores (replace with database in production)
const systemSettings = new Map([
  ['maintenance_mode', { key: 'maintenance_mode', value: false, updatedAt: new Date().toISOString() }],
  ['max_agents_per_user', { key: 'max_agents_per_user', value: 10, updatedAt: new Date().toISOString() }],
  ['rate_limit', { key: 'rate_limit', value: 1000, updatedAt: new Date().toISOString() }],
  ['auto_backup_enabled', { key: 'auto_backup_enabled', value: true, updatedAt: new Date().toISOString() }],
]);

const activityLogs = [];
const auditLogs = [];
const reports = new Map();
const notifications = [];

// GET /admin/system-stats - Get system statistics
router.get('/system-stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const stats = {
      system: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        platform: process.platform,
        nodeVersion: process.version,
      },
      resources: {
        cpu: {
          usage: 45.3,
          cores: 8,
        },
        memory: {
          total: 16384,
          used: 10175,
          free: 6209,
          usagePercent: 62.1,
        },
        disk: {
          total: 512000,
          used: 198144,
          free: 313856,
          usagePercent: 38.7,
        },
      },
      database: {
        connected: true,
        size: '2.4 GB',
        collections: 8,
        indexes: 24,
      },
      services: {
        api: 'healthy',
        agents: 'healthy',
        swarm: 'healthy',
        chat: 'healthy',
      },
    };
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[ADMIN] Get system stats error:', error);
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

// GET /admin/activity-logs - Get activity logs
router.get('/activity-logs', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { page = 1, limit = 50, type, severity, userId } = req.query;
    
    // Generate sample logs
    const sampleLogs = [
      {
        id: '1',
        type: 'user_login',
        severity: 'info',
        userId: 'user-123',
        userEmail: 'user@example.com',
        description: 'User logged in successfully',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: '2',
        type: 'agent_deployed',
        severity: 'info',
        userId: 'user-456',
        userEmail: 'admin@infinityxoa.com',
        description: 'Agent deployed: Executive Assistant Alpha',
        metadata: { agentId: 'agent-exec-1' },
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: '3',
        type: 'system_error',
        severity: 'error',
        description: 'Rate limit exceeded for user',
        userId: 'user-789',
        userEmail: 'heavy@user.com',
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
    ];
    
    let filteredLogs = sampleLogs;
    
    if (type) {
      filteredLogs = filteredLogs.filter(log => log.type === type);
    }
    
    if (severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === severity);
    }
    
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      logs: paginatedLogs,
      pagination: {
        total: filteredLogs.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredLogs.length / limit),
      },
    });
  } catch (error) {
    console.error('[ADMIN] Get activity logs error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// GET /admin/settings - Get system settings
router.get('/settings', authenticateToken, requireAdmin, (req, res) => {
  try {
    const settings = Array.from(systemSettings.values());
    
    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('[ADMIN] Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /admin/settings - Update system settings
router.put('/settings', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { key, value } = req.body;
    
    if (!key) {
      return res.status(400).json({ error: 'Setting key required' });
    }
    
    if (!systemSettings.has(key)) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    const setting = {
      key,
      value,
      updatedBy: req.user.id,
      updatedAt: new Date().toISOString(),
    };
    
    systemSettings.set(key, setting);
    
    // Log audit entry
    auditLogs.push({
      id: `audit-${Date.now()}`,
      action: 'setting_updated',
      userId: req.user.id,
      userEmail: req.user.email,
      details: { key, value },
      timestamp: new Date().toISOString(),
    });
    
    res.json({
      success: true,
      message: 'Setting updated successfully',
      setting,
    });
  } catch (error) {
    console.error('[ADMIN] Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// GET /admin/reports - Get available reports
router.get('/reports', authenticateToken, requireAdmin, (req, res) => {
  try {
    const availableReports = [
      {
        id: 'user-activity',
        name: 'User Activity Report',
        description: 'Detailed user activity and engagement metrics',
        format: ['pdf', 'csv', 'json'],
      },
      {
        id: 'agent-performance',
        name: 'Agent Performance Report',
        description: 'Agent execution statistics and performance metrics',
        format: ['pdf', 'csv', 'json'],
      },
      {
        id: 'swarm-analytics',
        name: 'Swarm Analytics Report',
        description: 'Swarm coordination and consensus analysis',
        format: ['pdf', 'csv', 'json'],
      },
      {
        id: 'system-health',
        name: 'System Health Report',
        description: 'System resources, errors, and performance',
        format: ['pdf', 'json'],
      },
    ];
    
    res.json({
      success: true,
      reports: availableReports,
    });
  } catch (error) {
    console.error('[ADMIN] Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST /admin/reports/generate - Generate custom report
router.post('/reports/generate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { reportType, startDate, endDate, format = 'json' } = req.body;
    
    if (!reportType) {
      return res.status(400).json({ error: 'Report type required' });
    }
    
    const report = {
      id: `report-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      type: reportType,
      status: 'generating',
      startDate,
      endDate,
      format,
      requestedBy: req.user.id,
      createdAt: new Date().toISOString(),
    };
    
    reports.set(report.id, report);
    
    // Simulate report generation
    setTimeout(() => {
      report.status = 'completed';
      report.completedAt = new Date().toISOString();
      report.downloadUrl = `/api/admin/reports/${report.id}/download`;
    }, 3000);
    
    res.status(202).json({
      success: true,
      message: 'Report generation started',
      report,
    });
  } catch (error) {
    console.error('[ADMIN] Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET /admin/audit-logs - Get audit trail
router.get('/audit-logs', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    
    // Generate sample audit logs
    const sampleAuditLogs = [
      {
        id: 'audit-1',
        action: 'user_role_changed',
        userId: req.user.id,
        userEmail: 'admin@infinityxoa.com',
        details: { targetUser: 'user-123', oldRole: 'user', newRole: 'admin' },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'audit-2',
        action: 'setting_updated',
        userId: req.user.id,
        userEmail: 'admin@infinityxoa.com',
        details: { key: 'maintenance_mode', value: false },
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
    
    let filteredLogs = sampleAuditLogs;
    
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    
    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      logs: paginatedLogs,
      pagination: {
        total: filteredLogs.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredLogs.length / limit),
      },
    });
  } catch (error) {
    console.error('[ADMIN] Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// POST /admin/backup - Trigger system backup
router.post('/backup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const backup = {
      id: `backup-${Date.now()}`,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      triggeredBy: req.user.id,
    };
    
    // Simulate backup process
    setTimeout(() => {
      backup.status = 'completed';
      backup.completedAt = new Date().toISOString();
      backup.size = '2.4 GB';
      backup.location = '/backups/backup-20260103.tar.gz';
    }, 5000);
    
    res.status(202).json({
      success: true,
      message: 'Backup started',
      backup,
    });
  } catch (error) {
    console.error('[ADMIN] Backup error:', error);
    res.status(500).json({ error: 'Failed to start backup' });
  }
});

// GET /admin/health - Health check
router.get('/health', authenticateToken, requireAdmin, (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: { status: 'healthy', responseTime: 5 },
        api: { status: 'healthy', responseTime: 2 },
        agents: { status: 'healthy', activeCount: 142 },
        swarm: { status: 'healthy', activeCount: 12 },
      },
    };
    
    res.json({
      success: true,
      health,
    });
  } catch (error) {
    console.error('[ADMIN] Health check error:', error);
    res.status(500).json({ error: 'Failed to perform health check' });
  }
});

// POST /admin/maintenance - Enable/disable maintenance mode
router.post('/maintenance', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { enabled, message } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Enabled flag (boolean) required' });
    }
    
    systemSettings.set('maintenance_mode', {
      key: 'maintenance_mode',
      value: enabled,
      message: message || 'System under maintenance',
      updatedBy: req.user.id,
      updatedAt: new Date().toISOString(),
    });
    
    res.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      maintenanceMode: enabled,
    });
  } catch (error) {
    console.error('[ADMIN] Maintenance mode error:', error);
    res.status(500).json({ error: 'Failed to update maintenance mode' });
  }
});

// GET /admin/notifications - Get system notifications
router.get('/notifications', authenticateToken, requireAdmin, (req, res) => {
  try {
    const sampleNotifications = [
      {
        id: '1',
        type: 'warning',
        title: 'High CPU Usage',
        message: 'System CPU usage above 80%',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: false,
      },
      {
        id: '2',
        type: 'info',
        title: 'Backup Completed',
        message: 'Daily backup completed successfully',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true,
      },
    ];
    
    res.json({
      success: true,
      notifications: sampleNotifications,
      unreadCount: sampleNotifications.filter(n => !n.read).length,
    });
  } catch (error) {
    console.error('[ADMIN] Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /admin/notifications/send - Send system notification
router.post('/notifications/send', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { type, title, message, targetUsers } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message required' });
    }
    
    const notification = {
      id: `notif-${Date.now()}`,
      type: type || 'info',
      title,
      message,
      targetUsers: targetUsers || 'all',
      sentBy: req.user.id,
      sentAt: new Date().toISOString(),
    };
    
    notifications.push(notification);
    
    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      notification,
    });
  } catch (error) {
    console.error('[ADMIN] Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Add missing GET endpoint for '/api/admin'
router.get('/api/admin', (req, res) => {
  res.json({
    success: true,
    message: 'Admin endpoint is active',
  });
});

module.exports = router;
