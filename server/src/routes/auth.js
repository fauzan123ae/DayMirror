import { Router } from 'express';
import { register, login, me, updateProfile, updateStreak, changePassword, deleteAccount } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register',        register);
router.post('/login',           login);
router.get('/me',               authMiddleware, me);
router.patch('/profile',        authMiddleware, updateProfile);
router.patch('/streak',         authMiddleware, updateStreak);
router.patch('/change-password',authMiddleware, changePassword);
router.delete('/account',       authMiddleware, deleteAccount);

export default router;
