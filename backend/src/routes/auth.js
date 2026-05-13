import express from 'express';
import { register, login, getMe, updateProfile, completeOnboarding } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/complete-onboarding', protect, completeOnboarding);

export default router;
