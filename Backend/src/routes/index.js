const express = require('express');
const { authRoutes } = require('./auth.routes');
const { tableRoutes } = require('./table.routes');
const { menuRoutes } = require('./menu.routes');
const { customerRoutes } = require('./customer.routes');
const { orderRoutes } = require('./order.routes');
const { paymentRoutes } = require('./payment.routes');

const routes = express.Router();

routes.use('/auth', authRoutes);
routes.use('/tables', tableRoutes);
routes.use('/', menuRoutes);
routes.use('/customer', customerRoutes);
routes.use('/orders', orderRoutes);
routes.use('/payments', paymentRoutes);

module.exports = { routes };
