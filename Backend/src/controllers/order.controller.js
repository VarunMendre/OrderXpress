const { validateCheckoutPayload } = require('../validators/order.schema');
const { createCheckout, listOrders, getOrderDetail, updateOrderStatus } = require('../services/order.service');

async function checkout(req, res, next) {
  try {
    const validation = validateCheckoutPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: validation.error } });
    }

    const sessionToken = req.headers['x-session-token'];
    const data = await createCheckout(sessionToken, req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function index(req, res, next) {
  try {
    const data = await listOrders(req.auth.adminId, req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function show(req, res, next) {
  try {
    const data = await getOrderDetail(req.auth.adminId, req.params.orderId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function status(req, res, next) {
  try {
    if (!req.body.action) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'action is required.' } });
    }

    const data = await updateOrderStatus(req.auth.adminId, req.params.orderId, req.body.action);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

module.exports = { checkout, index, show, status };
