const { validateSessionScanPayload, validateCartItemPayload } = require('../validators/customer.schema');
const {
  scanSession,
  getCustomerMenu,
  getCustomerSession,
  getCart,
  addCartItem,
  clearCart
} = require('../services/customer.service');

async function scan(req, res, next) {
  try {
    const validation = validateSessionScanPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: validation.error } });
    }
    const data = await scanSession(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function menu(req, res, next) {
  try {
    const token = req.headers['x-session-token'];
    const data = await getCustomerMenu(token);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function session(req, res, next) {
  try {
    const token = req.headers['x-session-token'];
    const data = await getCustomerSession(token);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function cart(req, res, next) {
  try {
    const token = req.headers['x-session-token'];
    const data = await getCart(token);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function addItem(req, res, next) {
  try {
    const validation = validateCartItemPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: validation.error } });
    }
    const token = req.headers['x-session-token'];
    const data = await addCartItem(token, { ...req.body, quantity: validation.quantity });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

async function clear(req, res, next) {
  try {
    const token = req.headers['x-session-token'];
    const data = await clearCart(token);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

module.exports = { scan, menu, session, cart, addItem, clear };
