import { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const departmentsController = {
  async list(_req: Request, res: Response) {
    try {
      const { rows } = await pool.query(
        'SELECT id, name, dept_head_id, created_at FROM departments ORDER BY name'
      );
      return res.json(rows.map(row => ({
        id: row.id.toString(),
        name: row.name,
        deptHeadId: row.dept_head_id?.toString() || null,
        createdAt: row.created_at
      })));
    } catch (err) {
      console.error('Departments list error:', err);
      return res.status(500).json({ error: 'Failed to fetch departments' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, dept_head_id } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Department name is required' });
      }

      const { rows } = await pool.query(
        'INSERT INTO departments (name, dept_head_id) VALUES ($1, $2) RETURNING id, name, dept_head_id, created_at',
        [name, dept_head_id || null]
      );

      return res.status(201).json({
        id: rows[0].id.toString(),
        name: rows[0].name,
        deptHeadId: rows[0].dept_head_id?.toString() || null,
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
      const { name, dept_head_id } = req.body;
      
      console.log('Update department request - ID:', id, 'Body:', { name, dept_head_id });
      
      if (!name) {
        console.log('Validation failed: Department name is required');
        return res.status(400).json({ error: 'Department name is required' });
      }

      console.log('Executing update query...');
      const query = 'UPDATE departments SET name = $1, dept_head_id = $2 WHERE id = $3 RETURNING id, name, dept_head_id, created_at';
      console.log('Query:', query);
      console.log('Parameters:', [name, dept_head_id || null, id]);
      
      const { rows } = await pool.query(query, [name, dept_head_id || null, id]);

      console.log('Query result rows:', rows);

      if (rows.length === 0) {
        console.log('No department found with ID:', id);
        return res.status(404).json({ error: 'Department not found' });
      }

      const response = {
        id: rows[0].id.toString(),
        name: rows[0].name,
        deptHeadId: rows[0].dept_head_id?.toString() || null,
        createdAt: rows[0].created_at
      };
      
      console.log('Update successful, returning:', response);
      return res.json(response);
    } catch (err) {
      console.error('Update department error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        code: (err as any)?.code,
        detail: (err as any)?.detail,
        hint: (err as any)?.hint
      });
      return res.status(500).json({ error: 'Failed to update department' });
    }
  },

  async reassignUsers(req: Request, res: Response) {
    try {
      const { id } = req.params; // department being deleted
      const { newDepartmentId } = req.body;
      
      console.log('Reassign users request - From department:', id, 'To department:', newDepartmentId);
      
      // Update all users in the department to the new department (or null if unassigned)
      const query = 'UPDATE users SET department_id = $1 WHERE department_id = $2';
      const params = [newDepartmentId || null, id];
      
      console.log('Executing reassignment query:', query);
      console.log('Parameters:', params);
      
      const { rows } = await pool.query(query, params);
      
      console.log('Reassignment complete, updated', rows.length, 'users');
      
      return res.json({ 
        message: 'Users reassigned successfully',
        usersUpdated: rows.length 
      });
    } catch (err) {
      console.error('Reassign users error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        code: (err as any)?.code,
        detail: (err as any)?.detail,
        hint: (err as any)?.hint
      });
      return res.status(500).json({ error: 'Failed to reassign users' });
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
