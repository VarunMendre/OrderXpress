const express = require('express');
const { scan, menu, session, cart, addItem, clear } = require('../controllers/customer.controller');

const customerRoutes = express.Router();

customerRoutes.post('/session/scan', scan);
customerRoutes.get('/menu', menu);
customerRoutes.get('/session', session);
customerRoutes.get('/cart', cart);
customerRoutes.post('/cart/items', addItem);
customerRoutes.post('/cart/clear', clear);

module.exports = { customerRoutes };
