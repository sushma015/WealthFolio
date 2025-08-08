const PortfolioModel = require('./portfolioData');

// Generate mock historical performance data
const generatePerformanceData = () => {
  const data = [];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  let baseValue = 100000; // Starting portfolio value
  
  for (let i = 0; i < 12; i++) {
    // Simulate some volatility
    const change = (Math.random() - 0.4) * 0.15; // Slight upward bias
    baseValue = baseValue * (1 + change);
    
    data.push({
      month: months[i],
      portfolio_value: Math.round(baseValue),
      benchmark: Math.round(100000 * (1 + i * 0.08 / 12)), // 8% annual return benchmark
      gain_loss: Math.round(baseValue - 100000),
      gain_loss_percent: ((baseValue - 100000) / 100000) * 100
    });
  }
  
  return data;
};

// Generate sector allocation data
const generateSectorData = () => {
  const portfolio = PortfolioModel.getAll();
  const sectorMap = {
    'AAPL': 'Technology',
    'GOOGL': 'Technology',
    'MSFT': 'Technology',
    'TSLA': 'Automotive',
    'BTC': 'Cryptocurrency',
    'ETH': 'Cryptocurrency',
    'US10Y': 'Bonds',
    'VTIAX': 'International'
  };
  
  const sectorAllocation = portfolio.reduce((acc, item) => {
    const sector = sectorMap[item.symbol] || 'Other';
    const value = item.current_price * item.quantity;
    
    if (!acc[sector]) {
      acc[sector] = { name: sector, value: 0, count: 0 };
    }
    
    acc[sector].value += value;
    acc[sector].count += 1;
    
    return acc;
  }, {});
  
  return Object.values(sectorAllocation).map(sector => ({
    ...sector,
    percentage: 0 // Will be calculated in the route
  }));
};

// Generate risk metrics
const generateRiskMetrics = () => {
  const portfolio = PortfolioModel.getAll();
  
  // Calculate portfolio volatility (simplified)
  const returns = portfolio.map(item => {
    const returnRate = (item.current_price - item.purchase_price) / item.purchase_price;
    return returnRate;
  });
  
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * 100;
  
  // Risk-adjusted metrics
  const sharpeRatio = avgReturn / (volatility / 100); // Simplified Sharpe ratio
  const maxDrawdown = Math.min(...returns) * 100;
  
  return {
    volatility: Math.round(volatility * 100) / 100,
    sharpe_ratio: Math.round(sharpeRatio * 100) / 100,
    max_drawdown: Math.round(maxDrawdown * 100) / 100,
    beta: 1.2, // Mock beta relative to market
    var_95: Math.round(avgReturn * 100 - 1.96 * volatility), // Value at Risk (95% confidence)
    correlation_spy: 0.85 // Correlation with S&P 500
  };
};

// Generate dividend/income data
const generateIncomeData = () => {
  const dividendStocks = ['AAPL', 'MSFT', 'VTIAX'];
  const portfolio = PortfolioModel.getAll();
  
  const incomeData = portfolio
    .filter(item => dividendStocks.includes(item.symbol))
    .map(item => {
      const annualDividend = {
        'AAPL': 0.96,
        'MSFT': 2.72,
        'VTIAX': 1.24
      }[item.symbol] || 0;
      
      const quarterlyIncome = (annualDividend * item.quantity) / 4;
      
      return {
        symbol: item.symbol,
        name: item.name,
        quarterly_income: Math.round(quarterlyIncome * 100) / 100,
        annual_income: Math.round(annualDividend * item.quantity * 100) / 100,
        yield: Math.round((annualDividend / item.current_price) * 10000) / 100
      };
    });
  
  const totalAnnualIncome = incomeData.reduce((sum, item) => sum + item.annual_income, 0);
  
  return {
    income_items: incomeData,
    total_annual_income: Math.round(totalAnnualIncome * 100) / 100,
    total_quarterly_income: Math.round((totalAnnualIncome / 4) * 100) / 100
  };
};

const PerformanceModel = {
  getHistoricalData: () => generatePerformanceData(),
  getSectorAllocation: () => generateSectorData(),
  getRiskMetrics: () => generateRiskMetrics(),
  getIncomeData: () => generateIncomeData(),
  
  // Get comprehensive performance dashboard data
  getDashboardData: () => {
    const portfolioSummary = PortfolioModel.getSummary();
    const historicalData = generatePerformanceData();
    const sectorData = generateSectorData();
    const riskMetrics = generateRiskMetrics();
    const incomeData = generateIncomeData();
    
    // Calculate sector percentages
    const totalValue = portfolioSummary.total_value;
    const sectorsWithPercentage = sectorData.map(sector => ({
      ...sector,
      percentage: Math.round((sector.value / totalValue) * 10000) / 100
    }));
    
    return {
      summary: portfolioSummary,
      historical_performance: historicalData,
      sector_allocation: sectorsWithPercentage,
      risk_metrics: riskMetrics,
      income_data: incomeData,
      last_updated: new Date().toISOString()
    };
  }
};

module.exports = PerformanceModel;
