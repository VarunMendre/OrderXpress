const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: '' }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true, index: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerSession', required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
    specialInstructions: { type: String, default: '' },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = { Cart };
