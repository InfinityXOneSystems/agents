/**
 * Site Scraper Routes
 */

const express = require('express');
const router = express.Router();
const SiteScraper = require('../lib/scraper/site-scraper');

const scraper = new SiteScraper();

/**
 * POST /api/scraper/start
 * Start scraping infinityxai.com and related sites
 */
router.post('/start', async (req, res) => {
  try {
    console.log('Starting site scrape...');
    const results = await scraper.scrapeAll();
    
    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scraper/data
 * Get all scraped data
 */
router.get('/data', (req, res) => {
  const data = scraper.getData();
  res.json({
    success: true,
    totalPages: data.length,
    pages: data
  });
});

/**
 * GET /api/scraper/search
 * Search scraped pages by keyword
 */
router.get('/search', (req, res) => {
  const { keyword } = req.query;
  
  if (!keyword) {
    return res.status(400).json({
      success: false,
      error: 'Keyword is required'
    });
  }

  const results = scraper.searchPages(keyword);
  res.json({
    success: true,
    keyword,
    matches: results.length,
    results
  });
});

/**
 * GET /api/scraper/apis
 * Get all discovered API endpoints
 */
router.get('/apis', (req, res) => {
  const apis = scraper.extractAllApis();
  res.json({
    success: true,
    total: apis.length,
    apis
  });
});

/**
 * POST /api/scraper/clear
 * Clear scraped data
 */
router.post('/clear', (req, res) => {
  scraper.clear();
  res.json({
    success: true,
    message: 'Scraped data cleared'
  });
});

// Add missing GET endpoint for '/api/scraper'
router.get('/api/scraper', (req, res) => {
  res.json({
    success: true,
    message: 'Scraper endpoint is active',
  });
});

module.exports = router;
