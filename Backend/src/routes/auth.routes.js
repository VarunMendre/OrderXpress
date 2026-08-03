const express = require('express');
const { register, login, logout, me } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/require-auth');

const authRoutes = express.Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/logout', requireAuth, logout);
authRoutes.get('/me', requireAuth, me);

module.exports = { authRoutes };
