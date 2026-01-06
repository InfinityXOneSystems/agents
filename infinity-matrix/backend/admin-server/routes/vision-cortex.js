/**
 * Vision Cortex Integration Routes
 * Handles communication between infinityxai.com/admin and infinityxai.com/intelligence
 * Primary Intelligence Endpoint: /intelligence
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('./auth');
const https = require('https');
const http = require('http');

// Store for vision cortex data
const visionCortexCache = new Map();

/**
 * Helper function to make HTTP/HTTPS requests
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'InfinityXAI-Admin/1.0',
        ...options.headers
      }
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            raw: data
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            raw: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * GET /vision-cortex/status
 * Check Vision Cortex connection status
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    console.log('[VISION-CORTEX] Testing connection to infinityxai.com/intelligence');
    
    const startTime = Date.now();
    let status = 'offline';
    let response = null;
    let error = null;

    try {
      // Try to connect to Intelligence Endpoint
      const visionResponse = await makeRequest('https://infinityxai.com/intelligence');
      response = {
        statusCode: visionResponse.statusCode,
        reachable: visionResponse.statusCode < 500,
        latency: Date.now() - startTime
      };
      
      if (visionResponse.statusCode === 200) {
        status = 'online';
      } else if (visionResponse.statusCode < 500) {
        status = 'accessible';
      }
    } catch (err) {
      error = err.message;
      status = 'offline';
    }

    const result = {
      success: true,
      visionCortex: {
        url: 'https://infinityxai.com/intelligence',
        primaryEndpoint: '/intelligence',
        status,
        tested: true,
        timestamp: new Date().toISOString(),
        response,
        error
      },
      admin: {
        url: 'https://infinityxai.com/admin',
        status: 'online',
        user: req.user.email
      }
    };

    // Cache the result
    visionCortexCache.set('last-status', result);

    res.json(result);

  } catch (error) {
    console.error('[VISION-CORTEX] Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check Vision Cortex status',
      message: error.message
    });
  }
});

/**
 * POST /vision-cortex/sync
 * Sync data with Vision Cortex
 */
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    console.log('[VISION-CORTEX] Initiating sync with Vision Cortex');
    
    const syncData = {
      source: 'infinityxai.com/admin',
      timestamp: new Date().toISOString(),
      user: req.user.email,
      data: req.body || {}
    };

    let result = null;
    let error = null;

    try {
      // Attempt to send data to Intelligence Endpoint
      result = await makeRequest('https://infinityxai.com/intelligence/api/sync', {
        method: 'POST',
        body: syncData
      });
    } catch (err) {
      error = err.message;
    }

    res.json({
      success: !error,
      sync: {
        attempted: true,
        timestamp: new Date().toISOString(),
        dataSent: syncData,
        response: result,
        error
      }
    });

  } catch (error) {
    console.error('[VISION-CORTEX] Sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync with Vision Cortex',
      message: error.message
    });
  }
});

/**
 * POST /vision-cortex/send
 * Send command or data to Vision Cortex
 */
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { action, data, endpoint } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Action is required'
      });
    }

    console.log(`[VISION-CORTEX] Sending action '${action}' to Vision Cortex`);

    const payload = {
      action,
      source: 'infinityxai.com/admin',
      user: req.user.email,
      timestamp: new Date().toISOString(),
      data: data || {}
    };

    const targetEndpoint = endpoint || '/api/receive';
    let result = null;
    let error = null;

    try {
      result = await makeRequest(`https://infinityxai.com/intelligence${targetEndpoint}`, {
        method: 'POST',
        body: payload
      });
    } catch (err) {
      error = err.message;
    }

    res.json({
      success: !error,
      sent: {
        action,
        endpoint: targetEndpoint,
        payload,
        response: result,
        error
      }
    });

  } catch (error) {
    console.error('[VISION-CORTEX] Send error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send to Vision Cortex',
      message: error.message
    });
  }
});

/**
 * GET /vision-cortex/fetch
 * Fetch data from Vision Cortex
 */
router.get('/fetch', authenticateToken, async (req, res) => {
  try {
    const { endpoint } = req.query;
    const targetEndpoint = endpoint || '/api/status';

    console.log(`[VISION-CORTEX] Fetching from Vision Cortex: ${targetEndpoint}`);

    let result = null;
    let error = null;

    try {
      result = await makeRequest(`https://infinityxai.com/intelligence${targetEndpoint}`);
    } catch (err) {
      error = err.message;
    }

    res.json({
      success: !error,
      fetched: {
        endpoint: targetEndpoint,
        timestamp: new Date().toISOString(),
        result,
        error
      }
    });

  } catch (error) {
    console.error('[VISION-CORTEX] Fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch from Vision Cortex',
      message: error.message
    });
  }
});

/**
 * POST /vision-cortex/test
 * Comprehensive test of Vision Cortex integration
 */
router.post('/test', authenticateToken, async (req, res) => {
  try {
    console.log('[VISION-CORTEX] Running comprehensive integration test');

    const tests = [];
    const startTime = Date.now();

    // Test 1: Connection test
    tests.push({
      name: 'Connection Test',
      description: 'Test basic connectivity to Vision Cortex',
      status: 'running'
    });

    try {
      const connResult = await makeRequest('http://infinityxoa.com/vision-cortex');
      tests[0].status = connResult.statusCode < 500 ? 'passed' : 'failed';
      tests[0].result = {
        statusCode: connResult.statusCode,
        reachable: connResult.statusCode < 500
      };
    } catch (err) {
      tests[0].status = 'failed';
      tests[0].error = err.message;
    }

    // Test 2: API endpoint test
    tests.push({
      name: 'API Endpoint Test',
      description: 'Test Vision Cortex API availability',
      status: 'running'
    });

    try {
      const apiResult = await makeRequest('http://infinityxoa.com/vision-cortex/api/status');
      tests[1].status = apiResult.statusCode === 200 ? 'passed' : 'partial';
      tests[1].result = {
        statusCode: apiResult.statusCode,
        data: apiResult.data
      };
    } catch (err) {
      tests[1].status = 'failed';
      tests[1].error = err.message;
    }

    // Test 3: Data sync test
    tests.push({
      name: 'Data Sync Test',
      description: 'Test bidirectional data synchronization',
      status: 'running'
    });

    try {
      const syncResult = await makeRequest('http://infinityxoa.com/vision-cortex/api/sync', {
        method: 'POST',
        body: {
          test: true,
          source: 'infinityxai.com/admin',
          timestamp: new Date().toISOString()
        }
      });
      tests[2].status = syncResult.statusCode === 200 ? 'passed' : 'partial';
      tests[2].result = {
        statusCode: syncResult.statusCode,
        data: syncResult.data
      };
    } catch (err) {
      tests[2].status = 'failed';
      tests[2].error = err.message;
    }

    const duration = Date.now() - startTime;
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;

    res.json({
      success: true,
      test: {
        totalTests: tests.length,
        passed,
        failed,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        tests
      }
    });

  } catch (error) {
    console.error('[VISION-CORTEX] Test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run Vision Cortex test',
      message: error.message
    });
  }
});

/**
 * GET /vision-cortex/cache
 * Get cached Vision Cortex data
 */
router.get('/cache', authenticateToken, (req, res) => {
  try {
    const cacheData = {
      lastStatus: visionCortexCache.get('last-status'),
      cacheSize: visionCortexCache.size,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      cache: cacheData
    });

  } catch (error) {
    console.error('[VISION-CORTEX] Cache error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cache',
      message: error.message
    });
  }
});

/**
 * DELETE /vision-cortex/cache
 * Clear Vision Cortex cache
 */
router.delete('/cache', authenticateToken, requireAdmin, (req, res) => {
  try {
    visionCortexCache.clear();

    res.json({
      success: true,
      message: 'Vision Cortex cache cleared',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[VISION-CORTEX] Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

// Add missing GET endpoint for '/api/vision-cortex'
router.get('/api/vision-cortex', (req, res) => {
  res.json({
    success: true,
    message: 'Vision Cortex endpoint is active',
  });
});

module.exports = router;
