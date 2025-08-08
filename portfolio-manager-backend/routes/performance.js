const express = require('express');
const PerformanceModel = require('../models/performanceData');

const router = express.Router();

// GET /api/performance/dashboard - Get comprehensive performance data
router.get('/dashboard', (req, res) => {
  try {
    const dashboardData = PerformanceModel.getDashboardData();
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch performance dashboard',
      message: error.message
    });
  }
});

// GET /api/performance/historical - Get historical performance data
router.get('/historical', (req, res) => {
  try {
    const historicalData = PerformanceModel.getHistoricalData();
    res.json({
      success: true,
      data: historicalData
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch historical performance data',
      message: error.message
    });
  }
});

// GET /api/performance/sectors - Get sector allocation data
router.get('/sectors', (req, res) => {
  try {
    const sectorData = PerformanceModel.getSectorAllocation();
    res.json({
      success: true,
      data: sectorData
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch sector allocation data',
      message: error.message
    });
  }
});

// GET /api/performance/risk - Get risk metrics
router.get('/risk', (req, res) => {
  try {
    const riskMetrics = PerformanceModel.getRiskMetrics();
    res.json({
      success: true,
      data: riskMetrics
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch risk metrics',
      message: error.message
    });
  }
});

// GET /api/performance/income - Get income/dividend data
router.get('/income', (req, res) => {
  try {
    const incomeData = PerformanceModel.getIncomeData();
    res.json({
      success: true,
      data: incomeData
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch income data',
      message: error.message
    });
  }
});

module.exports = router;
