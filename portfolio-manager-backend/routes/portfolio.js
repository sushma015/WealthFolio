const express = require('express');
const { body, param, validationResult } = require('express-validator');
const PortfolioModel = require('../models/portfolioData');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array()
    });
  }
  next();
};

// Portfolio item validation rules
const portfolioValidation = [
  body('symbol').notEmpty().withMessage('Symbol is required').isLength({ max: 10 }).withMessage('Symbol too long'),
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('type').isIn(['stock', 'bond', 'crypto', 'mutual_fund', 'etf']).withMessage('Invalid asset type'),
  body('quantity').isFloat({ min: 0.001 }).withMessage('Quantity must be a positive number'),
  body('purchase_price').isFloat({ min: 0.01 }).withMessage('Purchase price must be positive'),
  body('current_price').isFloat({ min: 0.01 }).withMessage('Current price must be positive'),
  body('purchase_date').isISO8601().withMessage('Invalid purchase date format')
];

// GET /api/portfolio - Get all portfolio items
router.get('/', (req, res) => {
  try {
    const portfolio = PortfolioModel.getAll();
    res.json({
      success: true,
      data: portfolio,
      count: portfolio.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch portfolio',
      message: error.message
    });
  }
});

// GET /api/portfolio/:id - Get specific portfolio item
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid portfolio item ID')
], handleValidationErrors, (req, res) => {
  try {
    const item = PortfolioModel.getById(req.params.id);
    if (!item) {
      return res.status(404).json({
        error: 'Portfolio item not found'
      });
    }
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch portfolio item',
      message: error.message
    });
  }
});

// POST /api/portfolio - Add new portfolio item
router.post('/', portfolioValidation, handleValidationErrors, (req, res) => {
  try {
    const newItem = PortfolioModel.create(req.body);
    res.status(201).json({
      success: true,
      data: newItem,
      message: 'Portfolio item created successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create portfolio item',
      message: error.message
    });
  }
});

// PUT /api/portfolio/:id - Update portfolio item
router.put('/:id', [
  param('id').isUUID().withMessage('Invalid portfolio item ID'),
  ...portfolioValidation
], handleValidationErrors, (req, res) => {
  try {
    const updatedItem = PortfolioModel.update(req.params.id, req.body);
    if (!updatedItem) {
      return res.status(404).json({
        error: 'Portfolio item not found'
      });
    }
    res.json({
      success: true,
      data: updatedItem,
      message: 'Portfolio item updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update portfolio item',
      message: error.message
    });
  }
});

// PATCH /api/portfolio/:id - Partial update portfolio item
router.patch('/:id', [
  param('id').isUUID().withMessage('Invalid portfolio item ID'),
  body('symbol').optional().isLength({ max: 10 }).withMessage('Symbol too long'),
  body('name').optional().isLength({ max: 100 }).withMessage('Name too long'),
  body('type').optional().isIn(['stock', 'bond', 'crypto', 'mutual_fund', 'etf']).withMessage('Invalid asset type'),
  body('quantity').optional().isFloat({ min: 0.001 }).withMessage('Quantity must be positive'),
  body('purchase_price').optional().isFloat({ min: 0.01 }).withMessage('Purchase price must be positive'),
  body('current_price').optional().isFloat({ min: 0.01 }).withMessage('Current price must be positive'),
  body('purchase_date').optional().isISO8601().withMessage('Invalid purchase date format')
], handleValidationErrors, (req, res) => {
  try {
    const updatedItem = PortfolioModel.update(req.params.id, req.body);
    if (!updatedItem) {
      return res.status(404).json({
        error: 'Portfolio item not found'
      });
    }
    res.json({
      success: true,
      data: updatedItem,
      message: 'Portfolio item updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update portfolio item',
      message: error.message
    });
  }
});

// DELETE /api/portfolio/:id - Delete portfolio item
router.delete('/:id', [
  param('id').isUUID().withMessage('Invalid portfolio item ID')
], handleValidationErrors, (req, res) => {
  try {
    const deleted = PortfolioModel.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        error: 'Portfolio item not found'
      });
    }
    res.json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete portfolio item',
      message: error.message
    });
  }
});

// GET /api/portfolio/summary/stats - Get portfolio summary statistics
router.get('/summary/stats', (req, res) => {
  try {
    const summary = PortfolioModel.getSummary();
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch portfolio summary',
      message: error.message
    });
  }
});

// GET /api/portfolio/search/:query - Search portfolio items
router.get('/search/:query', (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const portfolio = PortfolioModel.getAll();
    
    const results = portfolio.filter(item => 
      item.symbol.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      query: req.params.query
    });
  } catch (error) {
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

module.exports = router;
