import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authRateLimiter, refreshRateLimiter } from '../middleware/rateLimit.js';

export const authRoutes = Router();

authRoutes.post('/login', authRateLimiter, authController.login);
authRoutes.post('/refresh', refreshRateLimiter, authController.refresh); // relaxed limiter
authRoutes.post('/logout', refreshRateLimiter, authController.logout);  // relaxed limiter