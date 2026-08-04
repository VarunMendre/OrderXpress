const mongoose = require('mongoose');

const customerSessionSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true, index: true },
    sessionToken: { type: String, required: true, unique: true, index: true },
    sessionStatus: { type: String, default: 'active', index: true },
    activeOrderId: { type: mongoose.Schema.Types.ObjectId, default: null },
    lastActivityAt: { type: Date, default: () => new Date() },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

customerSessionSchema.index({ restaurantId: 1, tableId: 1, sessionStatus: 1 });

const CustomerSession = mongoose.model('CustomerSession', customerSessionSchema);

module.exports = { CustomerSession };
