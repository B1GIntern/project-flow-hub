import { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const getKPIs = async (req: Request, res: Response) => {
  try {
    console.log('Fetching KPIs from database...');
    
    const { rows } = await pool.query(`
      SELECT k.id, k.user_id, k.period_month, k.period_year, 
             k.tasks_completed, k.on_time_percentage, k.manager_rating,
             u.full_name as user_name, u.email as user_email,
             r.name as role_name, d.name as department_name
      FROM kpis k
      LEFT JOIN users u ON u.id = k.user_id
      LEFT JOIN roles r ON r.id = u.role_id
      LEFT JOIN departments d ON d.id = u.department_id
      ORDER BY k.period_year DESC, k.period_month DESC, u.full_name
    `);

    console.log('KPIs query result:', rows.length, 'KPIs found');

    const kpis = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      roleName: row.role_name,
      departmentName: row.department_name,
      periodMonth: row.period_month,
      periodYear: row.period_year,
      tasksCompleted: row.tasks_completed,
      onTimePercentage: row.on_time_percentage,
      managerRating: row.manager_rating
    }));

    console.log('Sending KPIs response:', kpis);
    res.json(kpis);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
};

export const createKPI = async (req: Request, res: Response) => {
  try {
    const { userId, periodMonth, periodYear, tasksCompleted, onTimePercentage, managerRating } = req.body;
    
    if (!userId || !periodMonth || !periodYear) {
      return res.status(400).json({ error: 'User ID, period month, and period year are required' });
    }

    const { rows } = await pool.query(`
      INSERT INTO kpis (user_id, period_month, period_year, tasks_completed, on_time_percentage, manager_rating)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, period_month, period_year, tasks_completed, on_time_percentage, manager_rating
    `, [userId, periodMonth, periodYear, tasksCompleted, onTimePercentage, managerRating]);

    const newKPI = {
      id: rows[0].id,
      userId: rows[0].user_id,
      periodMonth: rows[0].period_month,
      periodYear: rows[0].period_year,
      tasksCompleted: rows[0].tasks_completed,
      onTimePercentage: rows[0].on_time_percentage,
      managerRating: rows[0].manager_rating
    };
    
    res.status(201).json(newKPI);
  } catch (error) {
    console.error('Error creating KPI:', error);
    res.status(500).json({ error: 'Failed to create KPI' });
  }
};

export const updateKPI = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, periodMonth, periodYear, tasksCompleted, onTimePercentage, managerRating } = req.body;
    
    const { rows } = await pool.query(`
      UPDATE kpis 
      SET user_id = COALESCE($1, user_id), 
          period_month = COALESCE($2, period_month), 
          period_year = COALESCE($3, period_year),
          tasks_completed = COALESCE($4, tasks_completed),
          on_time_percentage = COALESCE($5, on_time_percentage),
          manager_rating = COALESCE($6, manager_rating)
      WHERE id = $7
      RETURNING id, user_id, period_month, period_year, tasks_completed, on_time_percentage, manager_rating
    `, [userId, periodMonth, periodYear, tasksCompleted, onTimePercentage, managerRating, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'KPI not found' });
    }

    const updatedKPI = {
      id: rows[0].id,
      userId: rows[0].user_id,
      periodMonth: rows[0].period_month,
      periodYear: rows[0].period_year,
      tasksCompleted: rows[0].tasks_completed,
      onTimePercentage: rows[0].on_time_percentage,
      managerRating: rows[0].manager_rating
    };
    
    res.json(updatedKPI);
  } catch (error) {
    console.error('Error updating KPI:', error);
    res.status(500).json({ error: 'Failed to update KPI' });
  }
};

export const deleteKPI = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { rowCount } = await pool.query('DELETE FROM kpis WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'KPI not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting KPI:', error);
    res.status(500).json({ error: 'Failed to delete KPI' });
  }
};
