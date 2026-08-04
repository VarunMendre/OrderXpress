const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    cuisineType: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    tableCount: { type: Number, required: true, min: 1 },
    isOpen: { type: Boolean, default: false },
    onboardingStatus: { type: String, default: 'draft', index: true }
  },
  { timestamps: true }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = { Restaurant };
