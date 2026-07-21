import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/restaurants - Get restaurant profile
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Restaurant routes - implementation pending'
  });
});

// PUT /api/restaurants - Update restaurant profile
router.put('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update restaurant - implementation pending'
  });
});

export default router;