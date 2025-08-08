const { v4: uuidv4 } = require('uuid');

// In-memory data store (replace with database in production)
let portfolioData = [
  {
    id: uuidv4(),
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    quantity: 50,
    purchase_price: 150.00,
    current_price: 175.50,
    purchase_date: '2023-01-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    type: 'stock',
    quantity: 25,
    purchase_price: 2800.00,
    current_price: 2950.75,
    purchase_date: '2023-02-20',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'stock',
    quantity: 30,
    purchase_price: 320.00,
    current_price: 378.85,
    purchase_date: '2023-01-25',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    type: 'stock',
    quantity: 15,
    purchase_price: 800.00,
    current_price: 245.60,
    purchase_date: '2023-03-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    quantity: 2.5,
    purchase_price: 45000.00,
    current_price: 52000.00,
    purchase_date: '2023-03-10',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    quantity: 10,
    purchase_price: 2800.00,
    current_price: 3200.00,
    purchase_date: '2023-03-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    symbol: 'US10Y',
    name: 'US Treasury 10 Year Bond',
    type: 'bond',
    quantity: 100,
    purchase_price: 98.50,
    current_price: 97.25,
    purchase_date: '2023-04-05',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: uuidv4(),
    symbol: 'VTIAX',
    name: 'Vanguard Total International Stock Index Fund',
    type: 'mutual_fund',
    quantity: 200,
    purchase_price: 28.50,
    current_price: 31.75,
    purchase_date: '2023-02-10',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Portfolio data access methods
const PortfolioModel = {
  // Get all portfolio items
  getAll: () => {
    return portfolioData;
  },

  // Get portfolio item by ID
  getById: (id) => {
    return portfolioData.find(item => item.id === id);
  },

  // Add new portfolio item
  create: (item) => {
    const newItem = {
      id: uuidv4(),
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    portfolioData.push(newItem);
    return newItem;
  },

  // Update portfolio item
  update: (id, updates) => {
    const index = portfolioData.findIndex(item => item.id === id);
    if (index === -1) return null;

    portfolioData[index] = {
      ...portfolioData[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return portfolioData[index];
  },

  // Delete portfolio item
  delete: (id) => {
    const index = portfolioData.findIndex(item => item.id === id);
    if (index === -1) return false;

    portfolioData.splice(index, 1);
    return true;
  },

  // Get portfolio summary statistics
  getSummary: () => {
    const totalValue = portfolioData.reduce((sum, item) => 
      sum + (item.current_price * item.quantity), 0
    );
    
    const totalCost = portfolioData.reduce((sum, item) => 
      sum + (item.purchase_price * item.quantity), 0
    );
    
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    // Group by asset type
    const assetAllocation = portfolioData.reduce((acc, item) => {
      const value = item.current_price * item.quantity;
      acc[item.type] = (acc[item.type] || 0) + value;
      return acc;
    }, {});

    // Top performers
    const itemsWithGains = portfolioData.map(item => ({
      ...item,
      gain_loss: (item.current_price - item.purchase_price) * item.quantity,
      gain_loss_percent: ((item.current_price - item.purchase_price) / item.purchase_price) * 100
    }));

    const topPerformers = itemsWithGains
      .sort((a, b) => b.gain_loss_percent - a.gain_loss_percent)
      .slice(0, 3);

    const worstPerformers = itemsWithGains
      .sort((a, b) => a.gain_loss_percent - b.gain_loss_percent)
      .slice(0, 3);

    return {
      total_value: totalValue,
      total_cost: totalCost,
      total_gain_loss: totalGainLoss,
      total_gain_loss_percent: totalGainLossPercent,
      total_items: portfolioData.length,
      asset_allocation: assetAllocation,
      top_performers: topPerformers,
      worst_performers: worstPerformers
    };
  }
};

module.exports = PortfolioModel;
