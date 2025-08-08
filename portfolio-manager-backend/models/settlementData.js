const { v4: uuidv4 } = require('uuid');

// In-memory settlement data (replace with database in production)
let settlementData = {
  balance: 25000.00,
  created_at: new Date().toISOString(),
  last_updated: new Date().toISOString()
};

let transactionHistory = [
  {
    id: uuidv4(),
    type: 'deposit',
    amount: 25000.00,
    description: 'Initial deposit',
    date: '2024-01-01',
    balance: 25000.00,
    created_at: new Date().toISOString()
  }
];

const SettlementModel = {
  // Get settlement account info
  getSettlement: () => {
    return {
      ...settlementData,
      transaction_count: transactionHistory.length
    };
  },

  // Get all transactions
  getTransactions: () => {
    return transactionHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  // Add new transaction
  addTransaction: (transactionData) => {
    const { type, amount, description } = transactionData;
    
    // Calculate new balance
    const newBalance = type === 'deposit' 
      ? settlementData.balance + amount 
      : settlementData.balance - amount;
    
    // Create transaction record
    const transaction = {
      id: uuidv4(),
      type,
      amount,
      description,
      date: new Date().toISOString().split('T')[0],
      balance: newBalance,
      created_at: new Date().toISOString()
    };
    
    // Update settlement balance
    settlementData.balance = newBalance;
    settlementData.last_updated = new Date().toISOString();
    
    // Add to transaction history
    transactionHistory.push(transaction);
    
    return transaction;
  },

  // Get current balance
  getBalance: () => {
    return settlementData.balance;
  },

  // Get transaction by ID
  getTransactionById: (id) => {
    return transactionHistory.find(transaction => transaction.id === id);
  },

  // Get transactions by type
  getTransactionsByType: (type) => {
    return transactionHistory.filter(transaction => transaction.type === type);
  },

  // Get recent transactions (limit)
  getRecentTransactions: (limit = 10) => {
    return transactionHistory
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  },

  // Calculate total deposits
  getTotalDeposits: () => {
    return transactionHistory
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  // Calculate total withdrawals
  getTotalWithdrawals: () => {
    return transactionHistory
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);
  },

  // Get transaction summary
  getTransactionSummary: () => {
    const deposits = SettlementModel.getTotalDeposits();
    const withdrawals = SettlementModel.getTotalWithdrawals();
    
    return {
      total_deposits: deposits,
      total_withdrawals: withdrawals,
      net_flow: deposits - withdrawals,
      transaction_count: transactionHistory.length,
      current_balance: settlementData.balance
    };
  }
};

module.exports = SettlementModel;
