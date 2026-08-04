const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { Admin } = require('../models/admin.model');
const { Restaurant } = require('../models/restaurant.model');
const { MerchantOnboarding } = require('../models/merchant-onboarding.model');

async function registerAdmin(payload) {
  const existing = await Admin.findOne({ email: payload.email.toLowerCase().trim() });
  if (existing) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const restaurant = await Restaurant.create({
    name: payload.restaurantName.trim(),
    address: payload.address.trim(),
    phone: payload.phone.trim(),
    tableCount: Number(payload.tableCount || 1),
    cuisineType: payload.cuisineType || '',
    onboardingStatus: 'draft'
  });

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const admin = await Admin.create({
    restaurantId: restaurant._id,
    ownerName: payload.ownerName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    passwordHash
  });

  const onboarding = await MerchantOnboarding.create({
    restaurantId: restaurant._id,
    ownerName: payload.ownerName.trim(),
    restaurantName: payload.restaurantName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    businessType: payload.businessType.trim(),
    businessCategory: payload.businessCategory.trim(),
    businessSubCategory: payload.businessSubCategory.trim(),
    address: payload.address.trim(),
    city: payload.city.trim(),
    state: payload.state.trim(),
    pincode: payload.pincode.trim(),
    pan: payload.pan.trim().toUpperCase(),
    gstin: payload.gstin ? payload.gstin.trim() : '',
    bankAccountNumber: payload.bankAccountNumber.trim(),
    ifsc: payload.ifsc.trim().toUpperCase(),
    transactionProfile: payload.transactionProfile.trim(),
    onboardingStatus: 'draft'
  });

  return {
    admin: toSafeAdmin(admin),
    restaurant: restaurant.toObject(),
    onboarding: onboarding.toObject()
  };
}

async function loginAdmin(payload) {
  const admin = await Admin.findOne({ email: payload.email.trim().toLowerCase() });
  if (!admin) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isValid = await bcrypt.compare(payload.password, admin.passwordHash);
  if (!isValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      adminId: String(admin._id),
      restaurantId: String(admin.restaurantId),
      email: admin.email
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  return { admin: toSafeAdmin(admin), token };
}

async function getCurrentAdmin(adminId) {
  const admin = await Admin.findById(adminId).lean();
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const restaurant = await Restaurant.findById(admin.restaurantId).lean();
  const onboarding = await MerchantOnboarding.findOne({ restaurantId: admin.restaurantId }).lean();

  return { admin: toSafeAdmin(admin), restaurant, onboarding };
}

async function submitOnboarding(adminId, payload) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const onboarding = await MerchantOnboarding.findOneAndUpdate(
    { restaurantId: admin.restaurantId },
    {
      ...payload,
      onboardingStatus: 'pending',
      submittedAt: new Date()
    },
    { new: true, upsert: true }
  );

  await Restaurant.findByIdAndUpdate(admin.restaurantId, {
    name: payload.restaurantName ? payload.restaurantName.trim() : undefined,
    address: payload.address ? payload.address.trim() : undefined,
    phone: payload.phone ? payload.phone.trim() : undefined,
    onboardingStatus: 'pending'
  });

  return onboarding.toObject();
}

async function getOnboardingStatus(adminId) {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  const onboarding = await MerchantOnboarding.findOne({ restaurantId: admin.restaurantId }).lean();
  return onboarding;
}

function toSafeAdmin(admin) {
  const plain = admin.toObject ? admin.toObject() : admin;
  delete plain.passwordHash;
  return plain;
}

module.exports = {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
  submitOnboarding,
  getOnboardingStatus
};
