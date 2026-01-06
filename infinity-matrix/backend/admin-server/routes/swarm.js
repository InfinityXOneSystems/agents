const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const crypto = require('crypto');

// In-memory swarm task store (replace with database in production)
const swarmTasks = new Map();
const swarmConfigurations = new Map();

// Default swarm configuration
const defaultSwarmConfig = {
  id: 'default-swarm',
  name: 'Default Swarm',
  agents: ['agent-exec-1', 'agent-exec-2'],
  coordinationStrategy: 'consensus',
  votingThreshold: 0.6,
  maxAgents: 5,
  timeout: 300000, // 5 minutes
  createdAt: new Date().toISOString(),
};

swarmConfigurations.set(defaultSwarmConfig.id, defaultSwarmConfig);

// POST /swarm/tasks - Create swarm task
router.post('/tasks', authenticateToken, (req, res) => {
  try {
    const { prompt, agents, strategy = 'consensus', priority = 'normal' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }
    
    const task = {
      id: `swarm-task-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      userId: req.user.id,
      prompt,
      agents: agents || ['agent-exec-1', 'agent-exec-2'],
      strategy,
      priority,
      status: 'pending',
      responses: [],
      consensus: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    swarmTasks.set(task.id, task);
    
    res.status(201).json({
      success: true,
      message: 'Swarm task created successfully',
      task,
    });
  } catch (error) {
    console.error('[SWARM] Create task error:', error);
    res.status(500).json({ error: 'Failed to create swarm task' });
  }
});

// GET /swarm/tasks - Get all swarm tasks
router.get('/tasks', authenticateToken, (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let userTasks = Array.from(swarmTasks.values());
    
    // Filter by user (non-admin)
    if (req.user.role !== 'admin') {
      userTasks = userTasks.filter(t => t.userId === req.user.id);
    }
    
    // Filter by status
    if (status) {
      userTasks = userTasks.filter(t => t.status === status);
    }
    
    // Sort by most recent
    userTasks.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTasks = userTasks.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      tasks: paginatedTasks,
      pagination: {
        total: userTasks.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(userTasks.length / limit),
      },
    });
  } catch (error) {
    console.error('[SWARM] Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch swarm tasks' });
  }
});

// GET /swarm/tasks/:id - Get swarm task by ID
router.get('/tasks/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const task = swarmTasks.get(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Swarm task not found' });
    }
    
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('[SWARM] Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch swarm task' });
  }
});

// POST /swarm/tasks/:id/execute - Execute swarm task
router.post('/tasks/:id/execute', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const task = swarmTasks.get(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Swarm task not found' });
    }
    
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (task.status === 'completed') {
      return res.status(400).json({ error: 'Task already completed' });
    }
    
    // Simulate swarm execution
    task.status = 'executing';
    task.startedAt = new Date().toISOString();
    
    // Simulate agent responses
    const agentResponses = task.agents.map((agentId, index) => ({
      agentId,
      response: `Agent ${agentId} response to: "${task.prompt}". Analysis ${index + 1} complete.`,
      confidence: 0.75 + Math.random() * 0.2,
      timestamp: new Date(Date.now() + index * 500).toISOString(),
      tokensUsed: Math.floor(Math.random() * 300) + 100,
    }));
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
    
    task.responses = agentResponses;
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    
    // Calculate consensus
    const avgConfidence = agentResponses.reduce((sum, r) => sum + r.confidence, 0) / agentResponses.length;
    task.consensus = {
      result: agentResponses[0].response,
      confidence: avgConfidence,
      agreement: avgConfidence > 0.8 ? 'high' : avgConfidence > 0.6 ? 'medium' : 'low',
      votes: agentResponses.map(r => ({ agentId: r.agentId, confidence: r.confidence })),
    };
    
    res.json({
      success: true,
      message: 'Swarm task executed successfully',
      task,
    });
  } catch (error) {
    console.error('[SWARM] Execute task error:', error);
    res.status(500).json({ error: 'Failed to execute swarm task' });
  }
});

// GET /swarm/tasks/:id/status - Get swarm task status
router.get('/tasks/:id/status', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const task = swarmTasks.get(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Swarm task not found' });
    }
    
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const status = {
      taskId: task.id,
      status: task.status,
      progress: task.status === 'completed' ? 100 : task.status === 'executing' ? 50 : 0,
      agentsInvolved: task.agents.length,
      responsesReceived: task.responses.length,
      consensusReached: task.consensus !== null,
      elapsedTime: task.startedAt ? Date.now() - new Date(task.startedAt).getTime() : 0,
    };
    
    res.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('[SWARM] Get status error:', error);
    res.status(500).json({ error: 'Failed to fetch task status' });
  }
});

// GET /swarm/consensus/:taskId - Get consensus result
router.get('/consensus/:taskId', authenticateToken, (req, res) => {
  try {
    const { taskId } = req.params;
    const task = swarmTasks.get(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Swarm task not found' });
    }
    
    if (task.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!task.consensus) {
      return res.status(400).json({ error: 'Consensus not yet reached' });
    }
    
    res.json({
      success: true,
      consensus: task.consensus,
      task: {
        id: task.id,
        prompt: task.prompt,
        status: task.status,
        completedAt: task.completedAt,
      },
    });
  } catch (error) {
    console.error('[SWARM] Get consensus error:', error);
    res.status(500).json({ error: 'Failed to fetch consensus' });
  }
});

// POST /swarm/configure - Configure swarm
router.post('/configure', authenticateToken, (req, res) => {
  try {
    const { name, agents, coordinationStrategy, votingThreshold, maxAgents, timeout } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const config = {
      id: `swarm-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      name: name || 'Custom Swarm',
      agents: agents || [],
      coordinationStrategy: coordinationStrategy || 'consensus',
      votingThreshold: votingThreshold || 0.6,
      maxAgents: maxAgents || 5,
      timeout: timeout || 300000,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
    };
    
    swarmConfigurations.set(config.id, config);
    
    res.status(201).json({
      success: true,
      message: 'Swarm configuration created successfully',
      configuration: config,
    });
  } catch (error) {
    console.error('[SWARM] Configure error:', error);
    res.status(500).json({ error: 'Failed to configure swarm' });
  }
});

// GET /swarm/analytics - Get swarm analytics
router.get('/analytics', authenticateToken, (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    const analytics = {
      period,
      totalTasks: swarmTasks.size,
      completedTasks: Array.from(swarmTasks.values()).filter(t => t.status === 'completed').length,
      averageExecutionTime: '12.3s',
      averageAgentsPerTask: 2.5,
      consensusRate: 92.5,
      performance: {
        successRate: 95.2,
        avgConfidence: 0.84,
        totalAgentInteractions: 487,
        totalTokensUsed: 125430,
      },
      topAgents: [
        { agentId: 'agent-exec-1', tasksParticipated: 145, avgConfidence: 0.87 },
        { agentId: 'agent-exec-2', tasksParticipated: 132, avgConfidence: 0.82 },
      ],
      dailyTasks: [12, 18, 15, 22, 19, 24, 21],
    };
    
    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('[SWARM] Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Add missing GET endpoint for '/api/swarm'
router.get('/api/swarm', (req, res) => {
  res.json({
    success: true,
    message: 'Swarm endpoint is active',
  });
});

module.exports = router;
