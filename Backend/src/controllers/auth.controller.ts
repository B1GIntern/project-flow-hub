import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { loadEnv } from '../config/env.js';
import { pool } from '../config/db.js';
import type { JwtPayload } from '../middleware/auth.js';

const env = loadEnv();
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const COOKIE_NAME = 'refreshToken';
const COOKIE_MAX_AGE_DAYS = 7;

function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, {
    path: '/',
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });
}

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as { email?: string; password?: string };
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData?.user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const { rows } = await pool.query(
        `SELECT u.id, u.role_id, u.manager_id, u.department_id, u.full_name, r.name::text AS role_name
         FROM users u
         JOIN roles r ON r.id = u.role_id
         WHERE u.auth_user_id = $1`,
        [authData.user.id]
      );

      const user = rows[0];
      if (!user) {
        return res.status(401).json({ error: 'User profile not found' });
      }

      const payload: JwtPayload = {
        userId: user.id,
        email,
        roleId: user.role_id,
        departmentId: user.department_id ?? undefined,
      };

      const accessOpts: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] };
      const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, accessOpts);
      const refreshOpts: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };
      const refreshToken = jwt.sign(
        { userId: user.id, email },
        env.JWT_REFRESH_SECRET,
        refreshOpts
      );

      setRefreshTokenCookie(res, refreshToken);

      return res.json({
        accessToken,
        user: {
          id: user.id,
          fullName: user.full_name,
          email,
          roleId: user.role_id,
          roleName: user.role_name,
          managerId: user.manager_id,
          departmentId: user.department_id,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Login failed' });
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.[COOKIE_NAME];
      if (!refreshToken) {
        return res.sendStatus(204);
      }

      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: number | string;
        email: string;
      };

      const { rows } = await pool.query(
        `SELECT u.id, u.role_id, u.manager_id, u.department_id, u.full_name, r.name::text AS role_name
         FROM users u
         JOIN roles r ON r.id = u.role_id
         WHERE u.id = $1`,
        [decoded.userId]
      );
      const user = rows[0];
      if (!user) return res.status(401).json({ error: 'User not found' });

      const payload: JwtPayload = {
        userId: user.id,
        email: decoded.email,
        roleId: user.role_id,
        departmentId: user.department_id ?? undefined,
      };

      const accessOpts: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] };
      const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, accessOpts);

      return res.json({
        accessToken,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: decoded.email,
          roleId: user.role_id,
          roleName: user.role_name,
          managerId: user.manager_id,
          departmentId: user.department_id,
        },
      });
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  },

  async logout(req: Request, res: Response) {
    clearRefreshTokenCookie(res);
    return res.json({ ok: true });
  },
};
