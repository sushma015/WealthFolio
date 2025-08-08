const express = require('express');
const { body, param, validationResult } = require('express-validator');
const SettlementModel = require('../models/settlementData');

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

// Transaction validation rules
const transactionValidation = [
  body('type').isIn(['deposit', 'withdrawal']).withMessage('Transaction type must be deposit or withdrawal'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().isLength({ max: 200 }).withMessage('Description too long')
];

// GET /api/settlement - Get settlement account info
router.get('/', (req, res) => {
  try {
    const settlement = SettlementModel.getSettlement();
    res.json({
      success: true,
      data: settlement
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch settlement data',
      message: error.message
    });
  }
});

// GET /api/settlement/transactions - Get transaction history
router.get('/transactions', (req, res) => {
  try {
    const transactions = SettlementModel.getTransactions();
    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch transactions',
      message: error.message
    });
  }
});

// POST /api/settlement/transaction - Add new transaction
router.post('/transaction', transactionValidation, handleValidationErrors, (req, res) => {
  try {
    const { type, amount, description } = req.body;
    
    const settlement = SettlementModel.getSettlement();
    
    // Check if withdrawal amount exceeds balance
    if (type === 'withdrawal' && amount > settlement.balance) {
      return res.status(400).json({
        error: 'Insufficient balance',
        message: `Cannot withdraw $${amount}. Current balance: $${settlement.balance}`
      });
    }
    
    const transaction = SettlementModel.addTransaction({
      type,
      amount: parseFloat(amount),
      description: description || (type === 'deposit' ? 'Cash deposit' : 'Cash withdrawal')
    });
    
    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to process transaction',
      message: error.message
    });
  }
});

// GET /api/settlement/balance - Get current balance only
router.get('/balance', (req, res) => {
  try {
    const settlement = SettlementModel.getSettlement();
    res.json({
      success: true,
      data: {
        balance: settlement.balance,
        last_updated: settlement.last_updated
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch balance',
      message: error.message
    });
  }
});

module.exports = router;
