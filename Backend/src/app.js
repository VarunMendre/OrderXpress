const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { routes } = require('./routes');
const { notFound } = require('./middleware/not-found');
const { errorHandler } = require('./middleware/error-handler');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan('dev'));

  app.use('/api/v1', routes);
  app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
  app.get('/ready', (_req, res) => res.json({ success: true, data: { status: 'ready' } }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
