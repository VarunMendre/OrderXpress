import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
} from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes (require authentication)
router.use(authenticate);
router.post('/logout', logout);
router.get('/refresh-token', refreshToken);
router.get('/me', getMe);
router.put('/profile', updateProfile);

export default router;