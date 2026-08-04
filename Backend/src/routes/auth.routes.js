const express = require('express');
const {
  register,
  login,
  logout,
  me,
  submitOnboardingHandler,
  onboardingStatus
} = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/require-auth');

const authRoutes = express.Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/logout', requireAuth, logout);
authRoutes.get('/me', requireAuth, me);
authRoutes.post('/onboarding/submit', requireAuth, submitOnboardingHandler);
authRoutes.get('/onboarding/status', requireAuth, onboardingStatus);

module.exports = { authRoutes };
