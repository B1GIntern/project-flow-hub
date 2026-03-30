import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export interface JwtPayload {
  userId: string;
  email: string;
  roleId: string;
  departmentId?: string;
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
    
    // The JWT contains roleId as UUID, but we also have roleName in the user object
    // Let's check if the user object has roleName, otherwise use the roleId lookup
    const userRoleName = (req.user as any).roleName || getRoleName(req.user.roleId);
    
    if (!allowedRoles.includes(userRoleName)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Fallback role mapping - but ideally we should use roleName from the user object
const ROLE_NAMES: Record<string, string> = {
  'ADMIN': 'ADMIN',
  'DEPT_HEAD': 'DEPT_HEAD', 
  'MANAGER': 'MANAGER',
  'SUPERVISOR': 'SUPERVISOR',
  'EMPLOYEE': 'EMPLOYEE',
};

function getRoleName(roleId: string): string {
  return ROLE_NAMES[roleId] ?? 'UNKNOWN';
}
