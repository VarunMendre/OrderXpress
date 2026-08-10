const crypto = require('crypto');
const { Table } = require('../models/table.model');
const { CustomerSession } = require('../models/customer-session.model');
const { MenuItem } = require('../models/menu-item.model');
const { Cart } = require('../models/cart.model');

async function scanSession(payload) {
  const incomingSignature = String(payload.signature || '').trim().replace(/^['"]|['"]$/g, '');
  const table = await Table.findOne({
    _id: payload.tableId,
    restaurantId: payload.restaurantId
  }).lean();

  if (!table) {
    const error = new Error('Table not found.');
    error.statusCode = 404;
    throw error;
  }

  const expectedSignature = String(table.qrSignature || '').trim().replace(/^['"]|['"]$/g, '');

  if (!expectedSignature || expectedSignature !== incomingSignature) {
    const error = new Error('Invalid QR signature.');
    error.statusCode = 401;
    throw error;
  }

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const existing = await CustomerSession.findOne({
    restaurantId: payload.restaurantId,
    tableId: payload.tableId,
    sessionStatus: 'active'
  }).sort({ createdAt: -1 });

  if (existing) {
    existing.lastActivityAt = new Date();
    existing.expiresAt = expiresAt;
    await existing.save();
    return existing.toObject();
  }

  const sessionToken = crypto.randomBytes(24).toString('hex');
  const created = await CustomerSession.create({
    restaurantId: payload.restaurantId,
    tableId: payload.tableId,
    sessionToken,
    sessionStatus: 'active',
    expiresAt
  });

  return created.toObject();
}

async function getCustomerMenu(sessionToken) {
  const session = await CustomerSession.findOne({ sessionToken, sessionStatus: 'active' }).lean();
  if (!session) {
    const error = new Error('Session not found.');
    error.statusCode = 404;
    throw error;
  }

  const items = await MenuItem.find({
    restaurantId: session.restaurantId,
    isAvailable: true
  })
    .sort({ category: 1, createdAt: -1 })
    .lean();

  return { session, items };
}

async function getCustomerSession(sessionToken) {
  return CustomerSession.findOne({ sessionToken }).lean();
}

async function getCart(sessionToken) {
  const session = await CustomerSession.findOne({ sessionToken, sessionStatus: 'active' }).lean();
  if (!session) {
    const error = new Error('Session not found.');
    error.statusCode = 404;
    throw error;
  }

  let cart = await Cart.findOne({ sessionId: session._id }).lean();
  if (!cart) {
    cart = await Cart.create({
      restaurantId: session.restaurantId,
      tableId: session.tableId,
      sessionId: session._id
    });
    return cart.toObject();
  }

  return cart;
}

async function addCartItem(sessionToken, payload) {
  const session = await CustomerSession.findOne({ sessionToken, sessionStatus: 'active' }).lean();
  if (!session) {
    const error = new Error('Session not found.');
    error.statusCode = 404;
    throw error;
  }

  const menuItem = await MenuItem.findOne({ _id: payload.menuItemId, restaurantId: session.restaurantId, isAvailable: true }).lean();
  if (!menuItem) {
    const error = new Error('Menu item not found.');
    error.statusCode = 404;
    throw error;
  }

  const cart = await Cart.findOneAndUpdate(
    { sessionId: session._id },
    { $setOnInsert: { restaurantId: session.restaurantId, tableId: session.tableId, sessionId: session._id } },
    { upsert: true, new: true }
  );

  cart.items.push({
    menuItemId: menuItem._id,
    nameSnapshot: menuItem.name,
    priceSnapshot: menuItem.price,
    quantity: Number(payload.quantity || 1),
    notes: payload.notes || ''
  });

  cart.subtotal = cart.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
  cart.total = cart.subtotal + cart.tax;
  await cart.save();
  return cart.toObject();
}

async function clearCart(sessionToken) {
  const session = await CustomerSession.findOne({ sessionToken, sessionStatus: 'active' }).lean();
  if (!session) {
    const error = new Error('Session not found.');
    error.statusCode = 404;
    throw error;
  }

  await Cart.deleteOne({ sessionId: session._id });
  return { cleared: true };
}

module.exports = {
  scanSession,
  getCustomerMenu,
  getCustomerSession,
  getCart,
  addCartItem,
  clearCart
};
