require('dotenv').config();

const config = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || '',
  redisUrl: process.env.REDIS_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  ocrProviderKey: process.env.OCR_PROVIDER_KEY || ''
};

function validateConfig() {
  const required = ['mongoUri', 'redisUrl', 'jwtSecret'];
  const missing = required.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

validateConfig();

module.exports = { config };
