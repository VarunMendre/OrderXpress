const mongoose = require('mongoose');

const menuImageSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    imageUrl: { type: String, required: true },
    fileName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    ocrStatus: { type: String, default: 'uploaded', index: true },
    retentionStatus: { type: String, default: 'retained', index: true }
  },
  { timestamps: true }
);

const MenuImage = mongoose.model('MenuImage', menuImageSchema);

module.exports = { MenuImage };
