import { Request, Response } from 'express';


import { pool } from '../config/db.js';

export const getTasks = async (req: Request, res: Response) => {
  try {
    console.log('Fetching tasks from database...');
    
    const { rows } = await pool.query(`
      SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, t.completed_at,
             t.created_at, t.project_id, t.assigned_to, t.created_by,
             p.name as project_name, u.full_name as assigned_to_name, u2.full_name as created_by_name
      FROM tasks t
      LEFT JOIN projects p ON p.id = t.project_id
      LEFT JOIN users u ON u.id = t.assigned_to
      LEFT JOIN users u2 ON u2.id = t.created_by
      ORDER BY t.created_at DESC
    `);

    console.log('Tasks query result:', rows.length, 'tasks found');

    const tasks = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date,
      completedAt: row.completed_at,
      projectId: row.project_id,
      projectName: row.project_name,
      assignedTo: row.assigned_to,
      assignedToName: row.assigned_to_name,
      createdBy: row.created_by,
      createdByName: row.created_by_name,
      createdAt: row.created_at
    }));

    console.log('Sending tasks response:', tasks);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    console.log('=== Task Creation Request ===');
    console.log('Request body:', req.body);
    console.log('Request user from auth middleware:', req.user);
    
    const { title, description, projectId, assignedTo, priority = 'MEDIUM', status = 'BACKLOG', dueDate } = req.body;
    
    console.log('Extracted data:', { title, description, projectId, assignedTo, priority, status, dueDate });
    
    if (!title || !projectId || !assignedTo) {
      console.log('Validation failed - missing fields:', { 
        title: !!title, 
        projectId: !!projectId, 
        assignedTo: !!assignedTo 
      });
      return res.status(400).json({ error: 'Title, project ID, and assigned user are required' });
    }

    const { rows } = await pool.query(`
      INSERT INTO tasks (title, description, project_id, assigned_to, priority, status, due_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, title, description, project_id, assigned_to, priority, status, due_date, created_by, created_at
    `, [title, description, projectId, assignedTo, priority, status, dueDate, req.user?.userId]);

    console.log('Database insertion result:', rows);
    console.log('New task ID:', rows[0]?.id);

    const newTask = {
      id: rows[0].id,
      title: rows[0].title,
      description: rows[0].description,
      status: rows[0].status,
      priority: rows[0].priority,
      dueDate: rows[0].due_date,
      projectId: rows[0].project_id,
      assignedTo: rows[0].assigned_to,
      createdAt: rows[0].created_at
    };
    
    console.log('Sending response:', newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, projectId, assignedTo, priority, status, dueDate, completedAt } = req.body;
    
    const { rows } = await pool.query(`
      UPDATE tasks 
      SET title = COALESCE($1, title), 
          description = COALESCE($2, description), 
          project_id = COALESCE($3, project_id), 
          assigned_to = COALESCE($4, assigned_to), 
          priority = COALESCE($5, priority), 
          status = COALESCE($6, status),
          due_date = COALESCE($7, due_date),
          completed_at = COALESCE($8, completed_at)
      WHERE id = $9
      RETURNING id, title, description, project_id, assigned_to, priority, status, due_date, created_at, completed_at
    `, [title, description, projectId, assignedTo, priority, status, dueDate, completedAt, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = {
      id: rows[0].id,
      title: rows[0].title,
      description: rows[0].description,
      status: rows[0].status,
      priority: rows[0].priority,
      dueDate: rows[0].due_date,
      projectId: rows[0].project_id,
      assignedTo: rows[0].assigned_to,
      createdAt: rows[0].created_at,
      completedAt: rows[0].completed_at
    };
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
