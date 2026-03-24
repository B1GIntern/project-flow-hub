import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from '../config/env.js';
import { pool } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const env = loadEnv();
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export async function getUsers(req: Request, res: Response) {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.role_id, u.manager_id, u.department_id, u.avatar,
             r.name as role_name, d.name as department_name,
             m.full_name as manager_name
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      LEFT JOIN departments d ON d.id = u.department_id
      LEFT JOIN users m ON m.id = u.manager_id
      ORDER BY u.full_name
    `);

    const users = rows.map(row => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      roleId: row.role_id,
      managerId: row.manager_id,
      departmentId: row.department_id,
      avatar: row.avatar,
      roleName: row.role_name,
      departmentName: row.department_name,
      managerName: row.manager_name,
    }));

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function registerUser(req: Request, res: Response) {
  try {
    console.log('Register user request body:', req.body);
    const { fullName, email, password, roleId, departmentId, managerId } = req.body;

    if (!fullName || !email || !password || !roleId) {
      console.log('Missing required fields:', { fullName, email, password: '***', roleId });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Creating Supabase auth user for:', email);

    // Step 1: Create or get Supabase Auth user
    let authUser;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.log('Supabase auth error:', authError);
      if (authError.message.includes('already been registered')) {
        console.log('User already exists in auth, finding existing user');
        // User already exists in auth, get the existing user by listing users
        const { data: existingUsers, error: fetchError } = await supabase.auth.admin.listUsers();
        if (fetchError) {
          console.error('Failed to list users:', fetchError);
          return res.status(400).json({ error: 'Failed to retrieve existing auth user' });
        }
        authUser = existingUsers.users.find(u => u.email === email);
        if (!authUser) {
          console.error('Auth user not found for email:', email);
          return res.status(400).json({ error: 'Auth user not found' });
        }
        console.log('Found existing auth user:', authUser.id);
      } else {
        console.error('Auth error:', authError);
        return res.status(400).json({ error: authError.message });
      }
    } else {
      authUser = authData.user;
      console.log('Created new auth user:', authUser.id);
    }

    // Step 2: Check if user already exists in users table
    console.log('Checking if user exists in database for auth_user_id:', authUser.id);
    const existingUser = await pool.query('SELECT id FROM users WHERE auth_user_id = $1', [authUser.id]);
    if (existingUser.rows.length > 0) {
      console.log('User already exists in database');
      return res.status(400).json({ error: 'User already exists in the system' });
    }

    // Step 3: Insert into users table
    console.log('Inserting user into database:', { authUserId: authUser.id, fullName, email, roleId, departmentId, managerId });
    const { rows } = await pool.query(`
      INSERT INTO users (auth_user_id, full_name, email, role_id, department_id, manager_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, full_name, email, role_id, department_id, manager_id, avatar
    `, [authUser.id, fullName, email, roleId, departmentId || null, managerId || null]);

    console.log('Successfully created user in database:', rows[0]);

    return res.status(201).json({
      id: rows[0].id,
      fullName: rows[0].full_name,
      email: rows[0].email,
      roleId: rows[0].role_id,
      departmentId: rows[0].department_id,
      managerId: rows[0].manager_id,
      avatar: rows[0].avatar,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const { fullName, email, authUserId, roleId, departmentId, managerId } = req.body;

    if (!fullName || !email || !authUserId || !roleId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { rows } = await pool.query(`
      INSERT INTO users (auth_user_id, full_name, email, role_id, department_id, manager_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, full_name, email, role_id, department_id, avatar
    `, [authUserId, fullName, email, roleId, departmentId || null, managerId || null]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { fullName, email, roleId, departmentId, managerId } = req.body;

    const { rows } = await pool.query(`
      UPDATE users 
      SET full_name = COALESCE($1, full_name),
          email = COALESCE($2, email),
          role_id = COALESCE($3, role_id),
          department_id = COALESCE($4, department_id),
          manager_id = COALESCE($5, manager_id),
          updated_at = NOW()
      WHERE id = $6
      RETURNING id, full_name, email, role_id, manager_id, department_id, avatar
    `, [fullName, email, roleId, departmentId, managerId, id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { rows: reports } = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE manager_id = $1',
      [id]
    );

    if (parseInt(reports[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete user with direct reports' });
    }

    const { rows: deptHead } = await pool.query(
      'SELECT COUNT(*) as count FROM departments WHERE dept_head_id = $1',
      [id]
    );

    if (parseInt(deptHead[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete department head' });
    }

    const { rows } = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}