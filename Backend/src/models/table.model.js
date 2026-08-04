const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    tableNumber: { type: Number, required: true },
    tableLabel: { type: String, required: true, trim: true },
    qrPayload: { type: String, default: '' },
    qrSignature: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

const Table = mongoose.model('Table', tableSchema);

module.exports = { Table };
