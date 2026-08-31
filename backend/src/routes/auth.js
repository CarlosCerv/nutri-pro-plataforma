import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { registerValidators, loginValidators, updateProfileValidators } from '../middleware/validators.js';

const router = express.Router();

router.post('/register', registerValidators, register);
router.post('/login', loginValidators, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidators, updateProfile);

export default router;
