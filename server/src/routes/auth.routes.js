import { Router } from 'express';
import { register, login, getProfile, updateSettings } from '../controllers/auth.controller.js';
import auth from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/profile', auth, getProfile);
router.get('/me', auth, getProfile); // Alias for frontend
router.put('/settings', auth, updateSettings);

export default router;
