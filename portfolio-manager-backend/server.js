const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const portfolioRoutes = require('./routes/portfolio');
const performanceRoutes = require('./routes/performance');
const settlementRoutes = require('./routes/settlement');

const app = express();
const PORT = 5000; // Fixed for local dev

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// CORS for local frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/settlement', settlementRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', time: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running locally at http://localhost:${PORT}`);
});
