const jwt = require('jsonwebtoken');
const { config } = require('../config');

function requireAuth(req, res, next) {
  const headerToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
    ? req.headers.authorization.slice(7).trim()
    : '';
  const token = headerToken || req.cookies.session;
  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } });
  }

  try {
    req.auth = jwt.verify(token, config.jwtSecret);
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Session expired or invalid.' } });
  }
}

module.exports = { requireAuth };
