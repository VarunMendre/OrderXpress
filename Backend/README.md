# OrderXpress Backend

Backend services for the OrderXpress restaurant ordering platform.

## Overview

This is a microservices-based backend built with Node.js, TypeScript, Express, MongoDB, and Redis. It implements the core functionality for:

- Admin authentication and management
- Restaurant and menu management
- Order processing and tracking
- Payment integration (Razorpay)
- Real-time notifications
- Reporting and analytics

## Project Structure

```
src/
├── config/           # Configuration files (database, environment)
├

<tool_call>
<function=Write>
<parameter=content>
# OrderXpress Backend

Backend services for the OrderXpress restaurant ordering platform.

## Overview

This is a microservices-based backend built with Node.js, TypeScript, Express, MongoDB, and Redis. It implements the core functionality for:

- Admin authentication and management
- Restaurant and menu management
- Order processing and tracking
- Payment integration (Razorpay)
- Real-time notifications
- Reporting and analytics

## Project Structure

```
src/
├── config/           # Configuration files (database, environment)
├── controllers/      # Request handlers
├── middleware/       # Custom middleware (auth, validation, error handling)
├── models/           # Database models (Mongoose schemas)
├── routes/           # API route definitions
├── services/         # Business logic services
├── utils/            # Utility functions (email, tokens, responses)
└── validators/       # Input validation schemas (Zod)
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Redis >= 6.0
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Update `.env` with your configuration values:
   - MongoDB connection string
   - Redis connection URL
   - JWT secret keys
   - Razorpay API keys (for payments)
   - Email service configuration (optional for development)

### Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000` by default.

Available endpoints:
- `GET /health` - Health check
- `POST /api/auth/register` - Register new admin/user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/restaurants` - Manage restaurants
- `POST /api/menu` - Manage menu items
- `POST /api/orders` - Manage orders
- `POST /api/payments` - Process payments

### Production Build

To create a production build:
```bash
npm run build
```

To start the production server:
```bash
npm start
```

### Testing

Run the test suite:
```bash
npm test
```

### Environment Variables

Copy `.env.example` to `.env` and configure the following:

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment (development/production) | development |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/orderxpress |
| REDIS_URL | Redis connection URL | redis://localhost:6379 |
| JWT_SECRET | Secret for signing JWTs | your_super_secret_key |
| JWT_ACCESS_EXPIRES_IN | Access token expiration | 15m |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiration | 7d |
| RAZORPAY_KEY_ID | Razorpay key ID | rzp_test_... |
| RAZORPAY_KEY_SECRET | Razorpay key secret | your_secret |
| RAZORPAY_WEBHOOK_SECRET | Razorpay webhook secret | your_webhook_secret |
| SMTP_HOST | Email SMTP host (optional) | smtp.example.com |
| SMTP_PORT | Email SMTP port (optional) | 587 |
| SMTP_USER | Email username (optional) | user@example.com |
| SMTP_PASS | Email password (optional) | password |

## API Documentation

Detailed API documentation is available in the `docs/` folder or via Swagger UI when running the application (endpoint: `/api-docs`).

## License

MIT