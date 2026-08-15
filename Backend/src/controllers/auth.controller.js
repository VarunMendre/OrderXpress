const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { validateRegisterPayload, validateLoginPayload } = require('../validators/auth.schema');
const {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
  submitOnboarding,
  getOnboardingStatus
} = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const validation = validateRegisterPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: validation.error } });
    }

    const result = await registerAdmin(req.body);
    const token = jwt.sign(
      {
        adminId: String(result.admin._id),
        restaurantId: String(result.admin.restaurantId),
        email: result.admin.email
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.cookie('session', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      data: result,
      tokens: {
        bearer: token
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const validation = validateLoginPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: validation.error } });
    }

    const result = await loginAdmin(req.body);
    res.cookie('session', result.token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      data: { admin: result.admin },
      tokens: {
        bearer: result.token
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function logout(_req, res) {
  res.clearCookie('session');
  return res.status(200).json({ success: true, data: { message: 'Logged out' } });
}

async function me(req, res, next) {
  try {
    const auth = req.auth;
    const result = await getCurrentAdmin(auth.adminId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}

async function submitOnboardingHandler(req, res, next) {
  try {
    const result = await submitOnboarding(req.auth.adminId, req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}

async function onboardingStatus(req, res, next) {
  try {
    const result = await getOnboardingStatus(req.auth.adminId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, logout, me, submitOnboardingHandler, onboardingStatus };
