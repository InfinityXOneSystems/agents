// /index Route
// Displays cleaned and labeled intelligence data.

const express = require('express');
const dataPipeline = require('../data_pipeline/cleaning_and_labeling');
const router = express.Router();

router.get('/index', (req, res) => {
  console.log('Accessing /index route...');
  const data = dataPipeline.getCleanedData();
  res.json({
    message: 'Cleaned and labeled intelligence data',
    data,
  });
});

module.exports = router;