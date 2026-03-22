import { Request, Response } from 'express';
import NodeCache from 'node-cache';
import { pool } from '../config/db.js';

const rolesCache = new NodeCache({ stdTTL: 300 }); // 5 min

export const rolesController = {
  async list(_req: Request, res: Response) {
    try {
      const cached = rolesCache.get<unknown>('roles');
      if (cached) return res.json(cached);

      const { rows } = await pool.query('SELECT id, name FROM roles ORDER BY id');
      rolesCache.set('roles', rows);
      return res.json(rows);
    } catch (err) {
      console.error('Roles list error:', err);
      return res.status(500).json({ error: 'Failed to fetch roles' });
    }
  },
};
