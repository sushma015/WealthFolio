# Portfolio Manager Backend API

A comprehensive REST API backend for the Portfolio Manager application, built with Node.js and Express.

## Features

- **Portfolio Management**: Full CRUD operations for portfolio items
- **Performance Analytics**: Historical performance data and risk metrics
- **Asset Allocation**: Sector-wise portfolio breakdown
- **Income Tracking**: Dividend and income data
- **Data Validation**: Input validation and error handling
- **Security**: Rate limiting, CORS, and security headers
- **Search**: Portfolio item search functionality

## API Endpoints

### Portfolio Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | Get all portfolio items |
| GET | `/api/portfolio/:id` | Get specific portfolio item |
| POST | `/api/portfolio` | Create new portfolio item |
| PUT | `/api/portfolio/:id` | Update portfolio item |
| PATCH | `/api/portfolio/:id` | Partial update portfolio item |
| DELETE | `/api/portfolio/:id` | Delete portfolio item |
| GET | `/api/portfolio/summary/stats` | Get portfolio summary statistics |
| GET | `/api/portfolio/search/:query` | Search portfolio items |

### Performance Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/performance/dashboard` | Get comprehensive performance data |
| GET | `/api/performance/historical` | Get historical performance data |
| GET | `/api/performance/sectors` | Get sector allocation data |
| GET | `/api/performance/risk` | Get risk metrics |
| GET | `/api/performance/income` | Get income/dividend data |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## Data Models

### Portfolio Item
```json
{
  "id": "uuid",
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "type": "stock", // stock, bond, crypto, mutual_fund, etf
  "quantity": 50,
  "purchase_price": 150.00,
  "current_price": 175.50,
  "purchase_date": "2023-01-15",
  "created_at": "2023-01-15T10:00:00.000Z",
  "updated_at": "2023-01-15T10:00:00.000Z"
}
```

### Portfolio Summary
```json
{
  "total_value": 250000.00,
  "total_cost": 200000.00,
  "total_gain_loss": 50000.00,
  "total_gain_loss_percent": 25.00,
  "total_items": 8,
  "asset_allocation": {
    "stock": 150000.00,
    "crypto": 80000.00,
    "bond": 20000.00
  },
  "top_performers": [...],
  "worst_performers": [...]
}
```

## Installation

1. **Clone and setup:**
```bash
cd portfolio-manager-backend
npm install
```

2. **Environment setup:**
Copy `.env` file and configure your settings:
```bash
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

3. **Start the server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Usage Examples

### Get All Portfolio Items
```bash
curl http://localhost:5000/api/portfolio
```

### Add New Portfolio Item
```bash
curl -X POST http://localhost:5000/api/portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "NVDA",
    "name": "NVIDIA Corporation",
    "type": "stock",
    "quantity": 10,
    "purchase_price": 400.00,
    "current_price": 450.00,
    "purchase_date": "2023-06-01"
  }'
```

### Get Performance Dashboard
```bash
curl http://localhost:5000/api/performance/dashboard
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": [] // Validation errors if applicable
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **Input Validation**: Request validation using express-validator
- **Error Handling**: Global error handler

## Development

### Project Structure
```
portfolio-manager-backend/
├── models/
│   ├── portfolioData.js    # Portfolio data model
│   └── performanceData.js  # Performance data model
├── routes/
│   ├── portfolio.js        # Portfolio routes
│   └── performance.js      # Performance routes
├── server.js               # Main server file
├── package.json
├── .env
└── README.md
```

### Adding New Features

1. **New Model**: Add to `models/` directory
2. **New Routes**: Add to `routes/` directory
3. **Register Routes**: Import and use in `server.js`

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Real-time stock price updates
- User authentication and authorization
- Portfolio optimization algorithms
- Email notifications
- Data export functionality
- Advanced charting data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
