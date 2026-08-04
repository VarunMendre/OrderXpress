const crypto = require('crypto');
const { CustomerSession } = require('../models/customer-session.model');
const { Cart } = require('../models/cart.model');
const { Order } = require('../models/order.model');

async function createCheckout(sessionToken, payload) {
  const session = await CustomerSession.findOne({ sessionToken, sessionStatus: 'active' }).lean();
  if (!session) {
    const error = new Error('Session not found.');
    error.statusCode = 404;
    throw error;
  }

  const cart = await Cart.findOne({ sessionId: session._id }).lean();
  if (!cart || !cart.items || cart.items.length === 0) {
    const error = new Error('Cart is empty.');
    error.statusCode = 400;
    throw error;
  }

  const orderNumber = `ORD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const orderStatus = payload.paymentMethod === 'cash' ? 'pending_payment' : 'pending_payment';
  const paymentStatus = payload.paymentMethod === 'cash' ? 'pending' : 'initiated';

  const order = await Order.create({
    restaurantId: session.restaurantId,
    tableId: session.tableId,
    sessionId: session._id,
    cartId: cart._id,
    orderNumber,
    orderType: payload.orderType,
    paymentMethod: payload.paymentMethod,
    paymentStatus,
    orderStatus,
    customerName: payload.customerName || '',
    phone: payload.phone || '',
    specialInstructions: payload.specialInstructions || '',
    items: cart.items,
    subtotal: cart.subtotal,
    tax: cart.tax,
    total: cart.total,
    currency: 'INR',
    placedAt: new Date(),
    timeline: [
      {
        status: orderStatus,
        by: 'system',
        note: payload.paymentMethod === 'cash' ? 'Cash checkout created' : 'Online checkout created'
      }
    ]
  });

  await CustomerSession.updateOne(
    { _id: session._id },
    {
      $set: {
        activeOrderId: order._id,
        lastActivityAt: new Date()
      }
    }
  );

  return order.toObject();
}

async function listOrders(adminId, filters = {}) {
  const { Admin } = require('../models/admin.model');
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const page = Math.max(Number(filters.page || 1), 1);
  const limit = Math.min(Math.max(Number(filters.limit || 10), 1), 50);
  const query = { restaurantId: admin.restaurantId };
  if (filters.status) query.orderStatus = filters.status;
  if (filters.tableId) query.tableId = filters.tableId;

  const [items, total] = await Promise.all([
    Order.find(query).sort({ placedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(query)
  ]);

  return {
    items: items.map((item) => ({
      orderId: item._id,
      orderNumber: item.orderNumber,
      placedAt: item.placedAt,
      status: item.orderStatus,
      tableId: item.tableId,
      totalAmount: item.total
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function getOrderDetail(adminId, orderId) {
  const { Admin } = require('../models/admin.model');
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const order = await Order.findOne({ _id: orderId, restaurantId: admin.restaurantId }).lean();
  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  return order;
}

async function updateOrderStatus(adminId, orderId, action) {
  const { Admin } = require('../models/admin.model');
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const map = {
    accept: 'accepted',
    complete: 'completed',
    cancel: 'cancelled'
  };

  const nextStatus = map[action];
  if (!nextStatus) {
    const error = new Error('Invalid action.');
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findOneAndUpdate(
    { _id: orderId, restaurantId: admin.restaurantId },
    {
      $set: { orderStatus: nextStatus },
      $push: {
        timeline: {
          status: nextStatus,
          by: 'admin',
          note: action
        }
      }
    },
    { new: true }
  );

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  return order.toObject();
}

module.exports = {
  createCheckout,
  listOrders,
  getOrderDetail,
  updateOrderStatus
};
