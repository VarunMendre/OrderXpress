const express = require('express');
const { requireAuth } = require('../middleware/require-auth');
const { checkout, index, show, status } = require('../controllers/order.controller');

const orderRoutes = express.Router();

orderRoutes.post('/checkout', checkout);
orderRoutes.use(requireAuth);
orderRoutes.get('/', index);
orderRoutes.get('/:orderId', show);
orderRoutes.patch('/:orderId/status', status);

module.exports = { orderRoutes };
