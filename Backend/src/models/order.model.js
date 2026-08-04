const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: '' }
  },
  { _id: true }
);

const orderTimelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: () => new Date() },
    by: { type: String, default: 'system' },
    note: { type: String, default: '' }
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true, index: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerSession', required: true, index: true },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', default: null },
    orderNumber: { type: String, required: true, unique: true, index: true },
    orderType: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: 'initiated', index: true },
    orderStatus: { type: String, default: 'draft', index: true },
    customerName: { type: String, default: '' },
    phone: { type: String, default: '' },
    specialInstructions: { type: String, default: '' },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    placedAt: { type: Date, default: () => new Date() },
    timeline: { type: [orderTimelineSchema], default: [] }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order };
