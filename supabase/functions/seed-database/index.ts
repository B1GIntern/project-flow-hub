// Supabase Edge Function: Seed database with auth.users + public tables
// Uses UUID primary keys (non-guessable). Direct PostgreSQL (Data API disabled).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import postgres from 'https://deno.land/x/postgresjs@v3.4.3/mod.js'

const MOCK_USERS = [
  { fullName: 'Sarah Chen', email: 'sarah.admin@corp.com', password: 'admin123!', roleName: 'ADMIN', managerEmail: null, deptName: null },
  { fullName: 'Marcus Wright', email: 'marcus.head@corp.com', password: 'tempPassword123!', roleName: 'DEPT_HEAD', managerEmail: null, deptName: 'Engineering' },
  { fullName: 'Elena Rodriguez', email: 'elena.mgr@corp.com', password: 'tempPassword123!', roleName: 'MANAGER', managerEmail: 'marcus.head@corp.com', deptName: 'Engineering' },
  { fullName: 'David Park', email: 'david.sup@corp.com', password: 'tempPassword123!', roleName: 'SUPERVISOR', managerEmail: 'elena.mgr@corp.com', deptName: 'Engineering' },
  { fullName: 'Alex Rivera', email: 'alex.emp@corp.com', password: 'tempPassword123!', roleName: 'EMPLOYEE', managerEmail: 'david.sup@corp.com', deptName: 'Engineering' },
  { fullName: 'Jessica Liu', email: 'jessica.head@corp.com', password: 'tempPassword123!', roleName: 'DEPT_HEAD', managerEmail: null, deptName: 'Marketing' },
  { fullName: 'Tom Bradley', email: 'tom.mgr@corp.com', password: 'tempPassword123!', roleName: 'MANAGER', managerEmail: 'jessica.head@corp.com', deptName: 'Marketing' },
  { fullName: 'Nina Patel', email: 'nina.sup@corp.com', password: 'tempPassword123!', roleName: 'SUPERVISOR', managerEmail: 'tom.mgr@corp.com', deptName: 'Marketing' },
  { fullName: 'Carlos Mendez', email: 'carlos.emp@corp.com', password: 'tempPassword123!', roleName: 'EMPLOYEE', managerEmail: 'nina.sup@corp.com', deptName: 'Marketing' },
  { fullName: 'Robert Kim', email: 'robert.head@corp.com', password: 'tempPassword123!', roleName: 'DEPT_HEAD', managerEmail: null, deptName: 'Operations' },
  { fullName: 'Amanda Foster', email: 'amanda.mgr@corp.com', password: 'tempPassword123!', roleName: 'MANAGER', managerEmail: 'robert.head@corp.com', deptName: 'Operations' },
  { fullName: 'James Wilson', email: 'james.sup@corp.com', password: 'tempPassword123!', roleName: 'SUPERVISOR', managerEmail: 'amanda.mgr@corp.com', deptName: 'Operations' },
  { fullName: 'Priya Sharma', email: 'priya.emp@corp.com', password: 'tempPassword123!', roleName: 'EMPLOYEE', managerEmail: 'james.sup@corp.com', deptName: 'Operations' },
  { fullName: 'Mike Johnson', email: 'mike.emp@corp.com', password: 'tempPassword123!', roleName: 'EMPLOYEE', managerEmail: 'david.sup@corp.com', deptName: 'Engineering' },
  { fullName: 'Lisa Wang', email: 'lisa.emp@corp.com', password: 'tempPassword123!', roleName: 'EMPLOYEE', managerEmail: 'nina.sup@corp.com', deptName: 'Marketing' },
]

const MOCK_PROJECTS = [
  { name: 'Q4 API Refactor', deptName: 'Engineering', status: 'ACTIVE' },
  { name: 'Mobile App v2', deptName: 'Engineering', status: 'PLANNING' },
  { name: 'Brand Refresh 2024', deptName: 'Marketing', status: 'ACTIVE' },
  { name: 'Social Media Campaign', deptName: 'Marketing', status: 'ACTIVE' },
  { name: 'Supply Chain Optimization', deptName: 'Operations', status: 'ACTIVE' },
  { name: 'Warehouse Automation', deptName: 'Operations', status: 'PLANNING' },
  { name: 'CI/CD Pipeline', deptName: 'Engineering', status: 'COMPLETED' },
  { name: 'Q1 Launch Event', deptName: 'Marketing', status: 'ON_HOLD' },
]

const MOCK_TASKS = [
  { projectName: 'Q4 API Refactor', title: 'Optimize Database Indices', description: 'Review and optimize slow queries', assignedEmail: 'alex.emp@corp.com', createdByEmail: 'elena.mgr@corp.com', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2024-11-30', completedAt: null },
  { projectName: 'Q4 API Refactor', title: 'API Rate Limiting', description: 'Implement rate limiting middleware', assignedEmail: 'mike.emp@corp.com', createdByEmail: 'elena.mgr@corp.com', priority: 'MEDIUM', status: 'TODO', dueDate: '2024-12-05', completedAt: null },
  { projectName: 'Q4 API Refactor', title: 'Auth Token Refresh', description: 'Fix token refresh flow', assignedEmail: 'alex.emp@corp.com', createdByEmail: 'david.sup@corp.com', priority: 'URGENT', status: 'REVIEW', dueDate: '2024-11-25', completedAt: null },
  { projectName: 'Mobile App v2', title: 'Wireframe Mobile Screens', description: 'Create wireframes for new flow', assignedEmail: 'mike.emp@corp.com', createdByEmail: 'elena.mgr@corp.com', priority: 'MEDIUM', status: 'DONE', dueDate: '2024-11-20', completedAt: '2024-11-18T10:00:00Z' },
  { projectName: 'Mobile App v2', title: 'Setup React Native Project', description: 'Init project and configure build', assignedEmail: 'alex.emp@corp.com', createdByEmail: 'elena.mgr@corp.com', priority: 'HIGH', status: 'TODO', dueDate: '2024-12-01', completedAt: null },
  { projectName: 'Brand Refresh 2024', title: 'Design New Logo Variants', description: 'Create 3 logo concepts', assignedEmail: 'carlos.emp@corp.com', createdByEmail: 'tom.mgr@corp.com', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2024-11-28', completedAt: null },
  { projectName: 'Brand Refresh 2024', title: 'Brand Guidelines Document', description: 'Write comprehensive brand guide', assignedEmail: 'lisa.emp@corp.com', createdByEmail: 'tom.mgr@corp.com', priority: 'MEDIUM', status: 'BACKLOG', dueDate: '2024-12-15', completedAt: null },
  { projectName: 'Social Media Campaign', title: 'Q4 Content Calendar', description: 'Plan social posts for Q4', assignedEmail: 'carlos.emp@corp.com', createdByEmail: 'nina.sup@corp.com', priority: 'HIGH', status: 'DONE', dueDate: '2024-11-10', completedAt: '2024-11-09T16:30:00Z' },
  { projectName: 'Social Media Campaign', title: 'Influencer Outreach', description: 'Contact top 20 influencers', assignedEmail: 'lisa.emp@corp.com', createdByEmail: 'tom.mgr@corp.com', priority: 'MEDIUM', status: 'IN_PROGRESS', dueDate: '2024-12-01', completedAt: null },
  { projectName: 'Supply Chain Optimization', title: 'Vendor Audit', description: 'Audit top 10 vendor contracts', assignedEmail: 'priya.emp@corp.com', createdByEmail: 'amanda.mgr@corp.com', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2024-11-30', completedAt: null },
  { projectName: 'Supply Chain Optimization', title: 'Logistics Dashboard', description: 'Build real-time tracking dashboard', assignedEmail: 'priya.emp@corp.com', createdByEmail: 'james.sup@corp.com', priority: 'URGENT', status: 'TODO', dueDate: '2024-12-10', completedAt: null },
  { projectName: 'Warehouse Automation', title: 'RFP for Robotics', description: 'Draft RFP for automation vendors', assignedEmail: 'priya.emp@corp.com', createdByEmail: 'amanda.mgr@corp.com', priority: 'LOW', status: 'BACKLOG', dueDate: '2025-01-15', completedAt: null },
  { projectName: 'CI/CD Pipeline', title: 'Setup GitHub Actions', description: 'Configure CI/CD pipeline', assignedEmail: 'alex.emp@corp.com', createdByEmail: 'elena.mgr@corp.com', priority: 'HIGH', status: 'DONE', dueDate: '2024-10-15', completedAt: '2024-10-14T09:00:00Z' },
  { projectName: 'CI/CD Pipeline', title: 'Docker Multi-stage Build', description: 'Optimize docker images', assignedEmail: 'mike.emp@corp.com', createdByEmail: 'david.sup@corp.com', priority: 'MEDIUM', status: 'DONE', dueDate: '2024-10-20', completedAt: '2024-10-19T14:00:00Z' },
  { projectName: 'Q4 API Refactor', title: 'GraphQL Schema Migration', description: 'Migrate REST endpoints to GraphQL', assignedEmail: 'mike.emp@corp.com', createdByEmail: 'elena.mgr@corp.com', priority: 'LOW', status: 'BACKLOG', dueDate: '2025-01-10', completedAt: null },
]

const MOCK_KPIS = [
  { userEmail: 'alex.emp@corp.com', periodMonth: 10, periodYear: 2024, tasksCompleted: 14, onTimePercentage: 92.5, managerRating: 4.8 },
  { userEmail: 'alex.emp@corp.com', periodMonth: 9, periodYear: 2024, tasksCompleted: 11, onTimePercentage: 85.0, managerRating: 4.2 },
  { userEmail: 'mike.emp@corp.com', periodMonth: 10, periodYear: 2024, tasksCompleted: 12, onTimePercentage: 88.0, managerRating: 4.5 },
  { userEmail: 'mike.emp@corp.com', periodMonth: 9, periodYear: 2024, tasksCompleted: 9, onTimePercentage: 78.0, managerRating: 3.8 },
  { userEmail: 'carlos.emp@corp.com', periodMonth: 10, periodYear: 2024, tasksCompleted: 10, onTimePercentage: 95.0, managerRating: 4.9 },
  { userEmail: 'lisa.emp@corp.com', periodMonth: 10, periodYear: 2024, tasksCompleted: 8, onTimePercentage: 62.5, managerRating: 3.2 },
  { userEmail: 'priya.emp@corp.com', periodMonth: 10, periodYear: 2024, tasksCompleted: 7, onTimePercentage: 71.0, managerRating: 3.5 },
  { userEmail: 'carlos.emp@corp.com', periodMonth: 9, periodYear: 2024, tasksCompleted: 13, onTimePercentage: 91.0, managerRating: 4.7 },
  { userEmail: 'priya.emp@corp.com', periodMonth: 9, periodYear: 2024, tasksCompleted: 6, onTimePercentage: 66.0, managerRating: 3.0 },
  { userEmail: 'lisa.emp@corp.com', periodMonth: 9, periodYear: 2024, tasksCompleted: 5, onTimePercentage: 55.0, managerRating: 2.8 },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const databaseUrl = Deno.env.get('DATABASE_URL')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!databaseUrl) {
      return jsonResponse({ error: 'Missing DATABASE_URL - set it as a secret for Edge Functions' }, 500)
    }
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: 'Missing Supabase config' }, 500)
    }

    const sql = postgres(databaseUrl, { prepare: false, max: 1 })
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    try {
      // 1. Ensure roles exist
      let roles = await sql`SELECT id, name FROM roles`
      if (roles.length === 0) {
        for (const name of ['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE']) {
          await sql`INSERT INTO roles (id, name) VALUES (gen_random_uuid(), ${name})`
        }
        roles = await sql`SELECT id, name FROM roles`
      }
      const roleIdByName = Object.fromEntries(roles.map((r: { id: string; name: string }) => [r.name, r.id]))

      // 2. Insert departments (idempotent)
      let depts = await sql`SELECT id, name FROM departments`
      if (depts.length === 0) {
        for (const name of ['Engineering', 'Marketing', 'Operations']) {
          await sql`INSERT INTO departments (id, name) VALUES (gen_random_uuid(), ${name})`
        }
        depts = await sql`SELECT id, name FROM departments`
      }
      const deptIdByName = Object.fromEntries(depts.map((d: { id: string; name: string }) => [d.name, d.id]))

      // 3. Create users in auth.users and insert into public.users
      const userIdByEmail: Record<string, string> = {}
      for (const u of MOCK_USERS) {
        const existing = await sql`SELECT id FROM public.users WHERE email = ${u.email}`
        if (existing.length > 0) {
          userIdByEmail[u.email] = (existing[0] as { id: string }).id
          continue
        }

        let authUserId: string | null = null
        const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
        })

        if (authUser?.user?.id) {
          authUserId = authUser.user.id
        } else if (authErr?.message?.toLowerCase().includes('already') || authErr?.message?.toLowerCase().includes('registered')) {
          const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
          const existingAuthUser = listData?.users?.find((x) => x.email === u.email)
          if (existingAuthUser) authUserId = existingAuthUser.id
        } else if (authErr) {
          console.error('createUser error', u.email, authErr)
          return jsonResponse({ error: `Failed to create user ${u.email}: ${authErr.message}` }, 400)
        }

        if (authUserId) {
          const roleId = roleIdByName[u.roleName]
          const departmentId = u.deptName ? deptIdByName[u.deptName] : null
          const managerId = u.managerEmail ? userIdByEmail[u.managerEmail] : null

          const inserted = await sql`
            INSERT INTO public.users (id, auth_user_id, full_name, email, role_id, manager_id, department_id)
            VALUES (gen_random_uuid(), ${authUserId}, ${u.fullName}, ${u.email}, ${roleId}, ${managerId}, ${departmentId})
            RETURNING id
          `
          userIdByEmail[u.email] = (inserted[0] as { id: string }).id
        }
      }

      // 4. Update department heads (by email)
      const deptHeads: Record<string, string> = {
        Engineering: 'marcus.head@corp.com',
        Marketing: 'jessica.head@corp.com',
        Operations: 'robert.head@corp.com',
      }
      for (const [deptName, headEmail] of Object.entries(deptHeads)) {
        const headId = userIdByEmail[headEmail]
        if (headId && deptIdByName[deptName]) {
          await sql`UPDATE departments SET dept_head_id = ${headId} WHERE id = ${deptIdByName[deptName]}`
        }
      }

      // 5. Insert projects
      let projects = await sql`SELECT id, name FROM projects`
      if (projects.length === 0) {
        for (const p of MOCK_PROJECTS) {
          const deptId = deptIdByName[p.deptName]
          await sql`INSERT INTO projects (id, name, department_id, status) VALUES (gen_random_uuid(), ${p.name}, ${deptId}, ${p.status})`
        }
        projects = await sql`SELECT id, name FROM projects`
      }
      const projectIdByName = Object.fromEntries(projects.map((p: { id: string; name: string }) => [p.name, p.id]))

      // 6. Insert tasks
      const tasks = await sql`SELECT id FROM tasks`
      if (tasks.length === 0) {
        for (const t of MOCK_TASKS) {
          const projectId = projectIdByName[t.projectName]
          const assignedTo = userIdByEmail[t.assignedEmail]
          const createdBy = userIdByEmail[t.createdByEmail]
          await sql`
            INSERT INTO tasks (id, project_id, title, description, assigned_to, created_by, priority, status, due_date, completed_at)
            VALUES (gen_random_uuid(), ${projectId}, ${t.title}, ${t.description}, ${assignedTo}, ${createdBy}, ${t.priority}, ${t.status}, ${t.dueDate}, ${t.completedAt})
          `
        }
      }

      // 7. Insert KPIs
      const kpis = await sql`SELECT id FROM kpis`
      if (kpis.length === 0) {
        for (const k of MOCK_KPIS) {
          const userId = userIdByEmail[k.userEmail]
          await sql`
            INSERT INTO kpis (id, user_id, period_month, period_year, tasks_completed, on_time_percentage, manager_rating)
            VALUES (gen_random_uuid(), ${userId}, ${k.periodMonth}, ${k.periodYear}, ${k.tasksCompleted}, ${k.onTimePercentage}, ${k.managerRating})
          `
        }
      }

      return jsonResponse({ ok: true, message: 'Database seeded successfully' })
    } finally {
      await sql.end()
    }
  } catch (err) {
    console.error('Seed error:', err)
    return jsonResponse({ error: String(err) }, 500)
  }
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
