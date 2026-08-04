const mongoose = require('mongoose');

const menuExtractionSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    menuImageId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuImage', required: true, index: true },
    provider: { type: String, required: true, trim: true },
    rawText: { type: String, default: '' },
    confidenceScore: { type: Number, default: 0 },
    detectedItems: { type: Array, default: [] },
    reviewStatus: { type: String, default: 'pending', index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    reviewedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const MenuExtraction = mongoose.model('MenuExtraction', menuExtractionSchema);

module.exports = { MenuExtraction };
