import rateLimit from 'express-rate-limit';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for login — protects against brute-force
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // was 5, increased to allow normal usage
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});

// Relaxed limiter for refresh — called automatically on every page load
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60, // generous since this is automatic, not user-triggered
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many refresh attempts, please try again later.' },
});