const crypto = require('crypto');
const { Payment } = require('../models/payment.model');
const { Order } = require('../models/order.model');
const { config } = require('../config');

function createIdempotencyKey(orderId, amount) {
  return crypto.createHash('sha256').update(`${orderId}:${amount}:${Date.now()}`).digest('hex');
}

async function createRazorpayOrder(payload) {
  const order = await Order.findById(payload.orderId);
  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  const idempotencyKey = createIdempotencyKey(payload.orderId, payload.amount);
  const payment = await Payment.create({
    restaurantId: order.restaurantId,
    orderId: order._id,
    method: 'online',
    status: 'initiated',
    amount: Number(payload.amount),
    currency: payload.currency || 'INR',
    razorpayOrderId: `rzp_${crypto.randomBytes(8).toString('hex')}`,
    idempotencyKey
  });

  await Order.updateOne(
    { _id: order._id },
    {
      $set: {
        paymentStatus: 'initiated',
        orderStatus: 'pending_payment'
      }
    }
  );

  return {
    payment: payment.toObject(),
    razorpayOrder: {
      id: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      keyId: config.razorpayKeyId || ''
    }
  };
}

async function verifyRazorpayPayment(payload) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;
  const expected = crypto
    .createHmac('sha256', config.razorpayKeySecret || '')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    const error = new Error('Invalid Razorpay signature.');
    error.statusCode = 401;
    throw error;
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      $set: {
        status: 'completed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      }
    },
    { new: true }
  );

  if (!payment) {
    const error = new Error('Payment not found.');
    error.statusCode = 404;
    throw error;
  }

  await Order.updateOne(
    { _id: payment.orderId },
    {
      $set: {
        paymentStatus: 'completed',
        orderStatus: 'paid'
      },
      $push: {
        timeline: {
          status: 'paid',
          by: 'system',
          note: 'payment verified'
        }
      }
    }
  );

  return payment.toObject();
}

async function handleWebhook(body, signature) {
  const expected = crypto
    .createHmac('sha256', config.razorpayWebhookSecret || '')
    .update(JSON.stringify(body))
    .digest('hex');

  if (expected !== signature) {
    const error = new Error('Invalid webhook signature.');
    error.statusCode = 401;
    throw error;
  }

  const eventId = body?.payload?.payment?.entity?.id || body?.event || crypto.randomUUID();
  const razorpayOrderId = body?.payload?.payment?.entity?.order_id;
  const razorpayPaymentId = body?.payload?.payment?.entity?.id;

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    {
      $set: {
        status: 'completed',
        razorpayPaymentId,
        webhookEventId: eventId
      }
    },
    { new: true }
  );

  if (!payment) {
    return { received: true, matched: false };
  }

  await Order.updateOne(
    { _id: payment.orderId },
    {
      $set: {
        paymentStatus: 'completed',
        orderStatus: 'paid'
      },
      $push: {
        timeline: {
          status: 'paid',
          by: 'system',
          note: 'webhook confirmed'
        }
      }
    }
  );

  return { received: true, matched: true };
}

async function markCashPaid(adminId, orderId) {
  const { Admin } = require('../models/admin.model');
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const order = await Order.findOneAndUpdate(
    { _id: orderId, restaurantId: admin.restaurantId, paymentMethod: 'cash' },
    {
      $set: {
        paymentStatus: 'completed',
        orderStatus: 'paid'
      },
      $push: {
        timeline: {
          status: 'paid',
          by: 'admin',
          note: 'cash marked paid'
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
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleWebhook,
  markCashPaid
};
