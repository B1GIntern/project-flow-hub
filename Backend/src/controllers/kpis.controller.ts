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

export const calculateKpis = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    
    console.log(`Calculating KPIs for month: ${month}, year: ${year}`);
    
    // Validate inputs
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }
    
    // First check if we have employees and tasks
    const employeeCheck = await pool.query(`
      SELECT COUNT(*) as count 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE r.name = 'EMPLOYEE'
    `);
    console.log('Employee count (role=EMPLOYEE):', employeeCheck.rows[0].count);
    
    const taskCheck = await pool.query('SELECT COUNT(*) as count FROM tasks WHERE status = $1', ['DONE']);
    console.log('Total completed tasks count:', taskCheck.rows[0].count);
    
    // Check for tasks in the specific month/year
    const monthlyTaskCheck = await pool.query(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE status = 'DONE' 
      AND EXTRACT(MONTH FROM due_date) = $1 
      AND EXTRACT(YEAR FROM due_date) = $2
    `, [month, year]);
    console.log(`Completed tasks for ${month}/${year}:`, monthlyTaskCheck.rows[0].count);
    
    // If no employees or no tasks for the period, return empty array
    if (employeeCheck.rows[0].count === 0) {
      console.log('No employees found with role=EMPLOYEE');
      return res.json([]);
    }
    
    if (monthlyTaskCheck.rows[0].count === 0) {
      console.log(`No completed tasks found for ${month}/${year}`);
      return res.json([]);
    }
    
    const { rows } = await pool.query(`
      WITH task_stats AS (
        SELECT 
          u.id as user_id,
          u.full_name,
          u.department_id,
          COUNT(CASE WHEN t.status = 'DONE' 
            AND EXTRACT(MONTH FROM t.due_date) = $1
            AND EXTRACT(YEAR FROM t.due_date) = $2
            THEN 1 END) as tasks_completed,
          COUNT(CASE WHEN t.status = 'DONE' 
            AND t.completed_at IS NOT NULL 
            AND t.completed_at::date <= t.due_date 
            THEN 1 END) as on_time_count,
          COUNT(CASE WHEN t.status = 'DONE' 
            AND EXTRACT(MONTH FROM t.due_date) = $1
            AND EXTRACT(YEAR FROM t.due_date) = $2
            THEN 1 END) as total_done
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN tasks t ON t.assigned_to = u.id
        WHERE r.name = 'EMPLOYEE'  -- Get actual employees by role name
        GROUP BY u.id, u.full_name, u.department_id
      )
      SELECT 
        ts.user_id,
        ts.full_name,
        ts.department_id,
        d.name as department_name,
        ts.tasks_completed,
        CASE WHEN ts.total_done > 0 
          THEN ROUND((ts.on_time_count::decimal / ts.total_done) * 100, 2)
          ELSE 0 
        END as on_time_percentage,
        COALESCE(k.manager_rating, 0) as manager_rating
      FROM task_stats ts
      LEFT JOIN departments d ON ts.department_id = d.id
      LEFT JOIN kpis k ON k.user_id = ts.user_id 
        AND k.period_month = $1 
        AND k.period_year = $2
      WHERE ts.tasks_completed > 0
      ORDER BY ts.full_name
    `, [month, year]);
    
    console.log(`KPI calculation result:`, rows.length, 'employees found');
    
    // Safe check - only log sample row if data exists
    if (rows.length > 0) {
      console.log('Sample row:', rows[0]);
    }
    
    // Transform to match frontend KPI interface format
    const kpis = rows.map(row => ({
      id: `calculated-${row.user_id}-${month}-${year}`,
      userId: row.user_id,
      full_name: row.full_name,
      department_id: row.department_id,
      department_name: row.department_name,
      periodMonth: parseInt(month as string),
      periodYear: parseInt(year as string),
      tasksCompleted: row.tasks_completed,
      onTimePercentage: row.on_time_percentage,
      managerRating: row.manager_rating
    }));
    
    console.log('Final KPIs to send:', kpis);
    res.json(kpis);
  } catch (error) {
    console.error('Error calculating KPIs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    res.status(500).json({ 
      error: 'Failed to calculate KPIs', 
      details: errorMessage
    });
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
