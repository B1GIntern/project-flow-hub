import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authRateLimiter } from '../middleware/rateLimit.js';

export const authRoutes = Router();

authRoutes.post('/login', authRateLimiter, authController.login);
authRoutes.post('/refresh', authRateLimiter, authController.refresh);
authRoutes.post('/logout', authRateLimiter, authController.logout);
