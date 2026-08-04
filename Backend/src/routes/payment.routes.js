const express = require('express');
const { requireAuth } = require('../middleware/require-auth');
const { razorpayOrder, verify, webhook, cashPaid } = require('../controllers/payment.controller');

const paymentRoutes = express.Router();

paymentRoutes.post('/webhook/razorpay', webhook);
paymentRoutes.post('/razorpay/order', requireAuth, razorpayOrder);
paymentRoutes.post('/razorpay/verify', requireAuth, verify);
paymentRoutes.post('/cash/:orderId/mark-paid', requireAuth, cashPaid);

module.exports = { paymentRoutes };
