import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export interface JwtPayload {
  userId: number;
  email: string;
  roleId: number;
  departmentId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const roleName = getRoleName(req.user.roleId);
    if (!allowedRoles.includes(roleName)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

const ROLE_NAMES: Record<number, string> = {
  1: 'ADMIN',
  2: 'DEPT_HEAD',
  3: 'MANAGER',
  4: 'SUPERVISOR',
  5: 'EMPLOYEE',
};

function getRoleName(roleId: number): string {
  return ROLE_NAMES[roleId] ?? 'UNKNOWN';
}
