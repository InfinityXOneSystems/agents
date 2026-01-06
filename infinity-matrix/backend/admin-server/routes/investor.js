const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const crypto = require('crypto');

// Middleware to require investor or admin role
const requireInvestor = (req, res, next) => {
  if (req.user.role !== 'investor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Investor access required' });
  }
  next();
};

// In-memory stores (replace with database in production)
const portfolios = new Map();
const transactions = new Map();
const investorReports = new Map();

// Initialize sample portfolio
const samplePortfolio = {
  investorId: 'investor-1',
  investments: [
    {
      id: 'inv-1',
      name: 'AI Agent Platform',
      amount: 500000,
      date: '2025-06-15',
      valuation: 625000,
      return: 25.0,
    },
    {
      id: 'inv-2',
      name: 'Swarm Intelligence Module',
      amount: 250000,
      date: '2025-08-20',
      valuation: 287500,
      return: 15.0,
    },
  ],
  totalInvested: 750000,
  currentValuation: 912500,
  totalReturn: 21.67,
};

portfolios.set('investor-1', samplePortfolio);

// GET /investor/dashboard - Get investor dashboard
router.get('/dashboard', authenticateToken, requireInvestor, (req, res) => {
  try {
    const dashboard = {
      overview: {
        totalInvested: 750000,
        currentValue: 912500,
        totalReturn: 21.67,
        returnAmount: 162500,
        activeInvestments: 2,
        exitedInvestments: 0,
      },
      performance: {
        monthlyReturn: 1.8,
        quarterlyReturn: 5.4,
        yearlyReturn: 21.67,
        performanceRating: 'excellent',
      },
      recentActivity: [
        {
          type: 'valuation_update',
          investment: 'AI Agent Platform',
          description: 'Quarterly valuation increased by 8%',
          date: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          type: 'revenue_milestone',
          investment: 'Swarm Intelligence Module',
          description: 'Reached $100K monthly recurring revenue',
          date: new Date(Date.now() - 259200000).toISOString(),
        },
      ],
      alerts: [
        {
          type: 'opportunity',
          title: 'New Investment Round',
          message: 'Series B funding round opening in Q2 2026',
          severity: 'info',
        },
      ],
    };
    
    res.json({
      success: true,
      dashboard,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[INVESTOR] Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch investor dashboard' });
  }
});

// GET /investor/portfolio - Get portfolio overview
router.get('/portfolio', authenticateToken, requireInvestor, (req, res) => {
  try {
    // In production, fetch by req.user.id
    const portfolio = portfolios.get('investor-1') || {
      investorId: req.user.id,
      investments: [],
      totalInvested: 0,
      currentValuation: 0,
      totalReturn: 0,
    };
    
    const detailedPortfolio = {
      ...portfolio,
      breakdown: {
        byStatus: {
          active: 2,
          exited: 0,
          pending: 0,
        },
        byPerformance: {
          outperforming: 2,
          meeting: 0,
          underperforming: 0,
        },
      },
      diversification: [
        { category: 'AI Agents', percentage: 66.7, amount: 500000 },
        { category: 'Swarm AI', percentage: 33.3, amount: 250000 },
      ],
      projections: {
        nextQuarter: 950000,
        nextYear: 1125000,
        estimatedReturn: 50.0,
      },
    };
    
    res.json({
      success: true,
      portfolio: detailedPortfolio,
    });
  } catch (error) {
    console.error('[INVESTOR] Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// GET /investor/returns - Get return on investment data
router.get('/returns', authenticateToken, requireInvestor, (req, res) => {
  try {
    const { period = '12m' } = req.query;
    
    const returns = {
      period,
      overall: {
        totalInvested: 750000,
        currentValue: 912500,
        totalReturn: 21.67,
        returnAmount: 162500,
        irr: 23.5, // Internal Rate of Return
      },
      byInvestment: [
        {
          id: 'inv-1',
          name: 'AI Agent Platform',
          invested: 500000,
          currentValue: 625000,
          return: 25.0,
          returnAmount: 125000,
        },
        {
          id: 'inv-2',
          name: 'Swarm Intelligence Module',
          invested: 250000,
          currentValue: 287500,
          return: 15.0,
          returnAmount: 37500,
        },
      ],
      timeline: [
        { month: 'Jan', value: 750000, return: 0 },
        { month: 'Feb', value: 768000, return: 2.4 },
        { month: 'Mar', value: 795000, return: 6.0 },
        { month: 'Apr', value: 825000, return: 10.0 },
        { month: 'May', value: 862500, return: 15.0 },
        { month: 'Jun', value: 912500, return: 21.67 },
      ],
      benchmarks: {
        sp500: 12.5,
        nasdaqai: 18.3,
        yourPerformance: 21.67,
        outperformance: 3.37,
      },
    };
    
    res.json({
      success: true,
      returns,
    });
  } catch (error) {
    console.error('[INVESTOR] Get returns error:', error);
    res.status(500).json({ error: 'Failed to fetch returns data' });
  }
});

// GET /investor/analytics - Get investment analytics
router.get('/analytics', authenticateToken, requireInvestor, (req, res) => {
  try {
    const analytics = {
      performance: {
        bestPerforming: {
          id: 'inv-1',
          name: 'AI Agent Platform',
          return: 25.0,
        },
        averageReturn: 20.0,
        volatility: 8.5,
        sharpeRatio: 2.35,
      },
      metrics: {
        totalRevenue: 450000,
        revenueGrowth: 45.3,
        userGrowth: 67.8,
        agentDeployments: 1247,
        activeUsers: 892,
      },
      milestones: [
        {
          investment: 'AI Agent Platform',
          title: 'Reached 1000 Active Users',
          date: '2025-12-01',
          impact: 'high',
        },
        {
          investment: 'Swarm Intelligence Module',
          title: 'First Enterprise Customer',
          date: '2025-11-15',
          impact: 'high',
        },
      ],
      risks: [
        {
          type: 'market',
          level: 'medium',
          description: 'AI market competition increasing',
          mitigation: 'Strong differentiation through swarm capabilities',
        },
        {
          type: 'technical',
          level: 'low',
          description: 'Platform scalability',
          mitigation: 'Cloud infrastructure with auto-scaling',
        },
      ],
    };
    
    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('[INVESTOR] Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /investor/reports - Get available reports
router.get('/reports', authenticateToken, requireInvestor, (req, res) => {
  try {
    const reports = [
      {
        id: 'quarterly-2025-q4',
        title: 'Q4 2025 Performance Report',
        type: 'quarterly',
        period: 'Q4 2025',
        date: '2025-12-31',
        status: 'available',
        format: ['pdf', 'excel'],
      },
      {
        id: 'annual-2025',
        title: '2025 Annual Investment Report',
        type: 'annual',
        period: '2025',
        date: '2025-12-31',
        status: 'available',
        format: ['pdf', 'excel'],
      },
      {
        id: 'monthly-2026-01',
        title: 'January 2026 Update',
        type: 'monthly',
        period: 'Jan 2026',
        date: '2026-01-31',
        status: 'generating',
        format: ['pdf'],
      },
    ];
    
    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error('[INVESTOR] Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST /investor/reports/download - Download report
router.post('/reports/download', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const { reportId, format = 'pdf' } = req.body;
    
    if (!reportId) {
      return res.status(400).json({ error: 'Report ID required' });
    }
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const download = {
      reportId,
      format,
      downloadUrl: `/api/investor/reports/${reportId}/file.${format}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      generatedAt: new Date().toISOString(),
    };
    
    res.json({
      success: true,
      message: 'Report ready for download',
      download,
    });
  } catch (error) {
    console.error('[INVESTOR] Download report error:', error);
    res.status(500).json({ error: 'Failed to generate report download' });
  }
});

// GET /investor/transactions - Get transaction history
router.get('/transactions', authenticateToken, requireInvestor, (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    const sampleTransactions = [
      {
        id: 'txn-1',
        type: 'investment',
        investment: 'AI Agent Platform',
        amount: 500000,
        date: '2025-06-15',
        status: 'completed',
        description: 'Series A investment',
      },
      {
        id: 'txn-2',
        type: 'investment',
        investment: 'Swarm Intelligence Module',
        amount: 250000,
        date: '2025-08-20',
        status: 'completed',
        description: 'Seed round investment',
      },
      {
        id: 'txn-3',
        type: 'dividend',
        investment: 'AI Agent Platform',
        amount: 12500,
        date: '2025-12-15',
        status: 'completed',
        description: 'Q4 profit distribution',
      },
    ];
    
    let filteredTransactions = sampleTransactions;
    
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      transactions: paginatedTransactions,
      pagination: {
        total: filteredTransactions.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredTransactions.length / limit),
      },
    });
  } catch (error) {
    console.error('[INVESTOR] Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /investor/performance - Get performance metrics
router.get('/performance', authenticateToken, requireInvestor, (req, res) => {
  try {
    const { period = '12m' } = req.query;
    
    const performance = {
      period,
      roi: {
        current: 21.67,
        projected: 35.0,
        benchmark: 18.3,
        outperformance: 3.37,
      },
      growth: {
        revenue: 45.3,
        users: 67.8,
        agents: 89.2,
        enterprise: 34.5,
      },
      metrics: {
        cac: 45, // Customer Acquisition Cost
        ltv: 2450, // Lifetime Value
        ltvCacRatio: 54.4,
        churnRate: 2.3,
        nrr: 115, // Net Revenue Retention
      },
      comparison: {
        yourReturn: 21.67,
        industryAverage: 15.2,
        topQuartile: 24.8,
        yourRanking: 'top 30%',
      },
      forecast: {
        nextQuarter: {
          expectedReturn: 24.5,
          confidence: 85,
        },
        nextYear: {
          expectedReturn: 50.0,
          confidence: 75,
        },
      },
    };
    
    res.json({
      success: true,
      performance,
    });
  } catch (error) {
    console.error('[INVESTOR] Get performance error:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Add missing GET endpoint for '/api/investor'
router.get('/api/investor', (req, res) => {
  res.json({
    success: true,
    message: 'Investor endpoint is active',
  });
});

module.exports = router;
