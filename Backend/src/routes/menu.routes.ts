import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/menu - Get menu items
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Menu routes - implementation pending'
  });
});

// POST /api/menu - Add menu item
router.post('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Add menu item - implementation pending'
  });
});

// PUT /api/menu/:id - Update menu item
router.put('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update menu item - implementation pending'
  });
});

// DELETE /api/menu/:id - Delete menu item
router.delete('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Delete menu item - implementation pending'
  });
});

export default router;