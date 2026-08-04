const express = require('express');
const { requireAuth } = require('../middleware/require-auth');
const { index, store, update, destroy, upload, extraction, review } = require('../controllers/menu.controller');

const menuRoutes = express.Router();

menuRoutes.use(requireAuth);
menuRoutes.get('/menu-items', index);
menuRoutes.post('/menu-items', store);
menuRoutes.patch('/menu-items/:itemId', update);
menuRoutes.delete('/menu-items/:itemId', destroy);
menuRoutes.post('/menu-images', upload);
menuRoutes.get('/menu-images/:imageId/extraction', extraction);
menuRoutes.post('/menu-images/:imageId/review', review);

module.exports = { menuRoutes };
