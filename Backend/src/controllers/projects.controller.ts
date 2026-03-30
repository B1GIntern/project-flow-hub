import { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const getProjects = async (req: Request, res: Response) => {
  try {
    console.log('Fetching projects from database...');
    
    const { rows } = await pool.query(`
      SELECT p.id, p.name, p.status, p.department_id, p.created_at,
             d.name as department_name
      FROM projects p
      LEFT JOIN departments d ON d.id = p.department_id
      ORDER BY p.created_at DESC
    `);

    console.log('Projects query result:', rows.length, 'projects found');

    const projects = rows.map(row => ({
      id: row.id,
      name: row.name,
      status: row.status,
      departmentId: row.department_id,
      departmentName: row.department_name,
      createdAt: row.created_at
    }));

    console.log('Sending projects response:', projects);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, departmentId, status = 'PLANNING' } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    if (!departmentId) {
      return res.status(400).json({ error: 'Department ID is required' });
    }

    const { rows } = await pool.query(`
      INSERT INTO projects (name, department_id, status)
      VALUES ($1, $2, $3)
      RETURNING id, name, status, department_id, created_at
    `, [name, departmentId, status]);

    const newProject = {
      id: rows[0].id,
      name: rows[0].name,
      status: rows[0].status,
      departmentId: rows[0].department_id,
      createdAt: rows[0].created_at
    };
    
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, departmentId, status } = req.body;
    
    const { rows } = await pool.query(`
      UPDATE projects 
      SET name = COALESCE($1, name), 
          department_id = COALESCE($2, department_id), 
          status = COALESCE($3, status)
      WHERE id = $4
      RETURNING id, name, status, department_id, created_at
    `, [name, departmentId, status, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = {
      id: rows[0].id,
      name: rows[0].name,
      status: rows[0].status,
      departmentId: rows[0].department_id,
      createdAt: rows[0].created_at
    };
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};
