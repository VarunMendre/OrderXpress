const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, index: true },
    imageUrl: { type: String, default: '' },
    isVegetarian: { type: Boolean, default: false },
    portionType: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true, index: true },
    sourceExtractionId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuExtraction', default: null }
  },
  { timestamps: true }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = { MenuItem };
