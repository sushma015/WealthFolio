const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const app = require('../server');
module.exports = app;


const portfolioRoutes = require('../routes/portfolio');
const performanceRoutes = require('../routes/performance');
const settlementRoutes = require('../routes/settlement');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/settlement', settlementRoutes);

module.exports = app;
