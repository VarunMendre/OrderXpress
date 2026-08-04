const mongoose = require('mongoose');

const merchantOnboardingSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    ownerName: { type: String, required: true, trim: true },
    restaurantName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true },
    businessType: { type: String, required: true, trim: true },
    businessCategory: { type: String, required: true, trim: true },
    businessSubCategory: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    pan: { type: String, required: true, trim: true, uppercase: true, index: true },
    gstin: { type: String, default: '', trim: true },
    bankAccountNumber: { type: String, required: true, trim: true },
    ifsc: { type: String, required: true, trim: true, uppercase: true },
    transactionProfile: { type: String, required: true, trim: true },
    onboardingStatus: { type: String, default: 'draft', index: true },
    razorpayMerchantId: { type: String, default: '' },
    submittedAt: { type: Date },
    reviewedAt: { type: Date }
  },
  { timestamps: true }
);

const MerchantOnboarding = mongoose.model('MerchantOnboarding', merchantOnboardingSchema);

module.exports = { MerchantOnboarding };
