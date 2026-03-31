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

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;

      console.log('Received role creation request:', { name, body: req.body });

      if (!name || !name.trim()) {
        console.log('Validation failed: Role name is empty');
        res.status(400).json({ 
          error: 'Role name is required' 
        });
        return;
      }

      const roleName = name.trim().replace(/\s+/g, '_').toUpperCase();
      console.log('Processed role name for database:', roleName);

      const result = await pool.query(
        `INSERT INTO roles (name) 
         VALUES ($1) 
         RETURNING *`,
        [roleName]
      );

      console.log('Database insert successful:', result.rows[0]);

      // Clear cache
      rolesCache.del('roles');

      res.status(201).json(result.rows[0]);
    } catch (error) {
      const err = error as Error;
      console.error('Error creating role:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        body: req.body,
        name: req.body?.name
      });
      res.status(500).json({ 
        error: 'Failed to create role',
        details: err.message
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Role name is required' });
      }

      const { rows } = await pool.query(
        'UPDATE roles SET name = $1 WHERE id = $2 RETURNING id, name',
        [name.trim(), id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Clear cache
      rolesCache.del('roles');

      return res.json(rows[0]);
    } catch (err) {
      console.error('Role update error:', err);
      return res.status(500).json({ error: 'Failed to update role' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      console.log('Received delete request for role id:', id);
      
      const { rowCount } = await pool.query('DELETE FROM roles WHERE id = $1', [id]);
      
      console.log('Database delete result:', { rowCount, id });
      
      if (rowCount === 0) {
        console.log('Role not found in database');
        return res.status(404).json({ error: 'Role not found' });
      }

      // Clear cache
      rolesCache.del('roles');

      console.log('Role deleted successfully from database');
      return res.status(204).send();
    } catch (err) {
      console.error('Role delete error:', err);
      return res.status(500).json({ error: 'Failed to delete role' });
    }
  },
};
