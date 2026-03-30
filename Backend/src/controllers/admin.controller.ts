import { Request, Response } from 'express';
import { pool } from '../config/db.js';

export async function forceDeleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    console.log('Force delete user:', id);
    
    // First clear any department head references
    await pool.query(
      'UPDATE departments SET dept_head_id = NULL WHERE dept_head_id = $1',
      [id]
    );
    
    // Then delete the user (cascades to clean up dependencies)
    const { rows } = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, full_name',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Force deleted user:', rows[0]);
    res.json({ 
      message: 'User force deleted successfully',
      user: rows[0]
    });
  } catch (error) {
    console.error('Error force deleting user:', error);
    res.status(500).json({ error: 'Failed to force delete user' });
  }
}
