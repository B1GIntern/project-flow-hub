import { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const departmentsController = {
  async list(_req: Request, res: Response) {
    try {
      const { rows } = await pool.query(
        'SELECT id, name, created_at FROM departments ORDER BY name'
      );
      return res.json(rows.map(row => ({
        id: row.id,
        name: row.name,
        createdAt: row.created_at
      })));
    } catch (err) {
      console.error('Departments list error:', err);
      return res.status(500).json({ error: 'Failed to fetch departments' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Department name is required' });
      }

      const { rows } = await pool.query(
        'INSERT INTO departments (name) VALUES ($1) RETURNING id, name, created_at',
        [name]
      );

      return res.status(201).json({
        id: rows[0].id,
        name: rows[0].name,
        createdAt: rows[0].created_at
      });
    } catch (err) {
      console.error('Create department error:', err);
      return res.status(500).json({ error: 'Failed to create department' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Department name is required' });
      }

      const { rows } = await pool.query(
        'UPDATE departments SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, created_at',
        [name, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Department not found' });
      }

      return res.json({
        id: rows[0].id,
        name: rows[0].name,
        createdAt: rows[0].created_at
      });
    } catch (err) {
      console.error('Update department error:', err);
      return res.status(500).json({ error: 'Failed to update department' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if department has users
      const { rows: usersCount } = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE department_id = $1',
        [id]
      );

      if (parseInt(usersCount[0].count) > 0) {
        return res.status(400).json({ error: 'Cannot delete department with users' });
      }

      const { rows } = await pool.query(
        'DELETE FROM departments WHERE id = $1 RETURNING id',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Department not found' });
      }

      return res.status(204).send();
    } catch (err) {
      console.error('Delete department error:', err);
      return res.status(500).json({ error: 'Failed to delete department' });
    }
  }
};
