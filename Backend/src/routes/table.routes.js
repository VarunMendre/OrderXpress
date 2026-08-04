const express = require('express');
const { requireAuth } = require('../middleware/require-auth');
const { generate, index, qr, session } = require('../controllers/table.controller');

const tableRoutes = express.Router();

tableRoutes.use(requireAuth);
tableRoutes.post('/generate', generate);
tableRoutes.get('/', index);
tableRoutes.post('/:tableId/qr', qr);
tableRoutes.get('/:tableId/session', session);

module.exports = { tableRoutes };
