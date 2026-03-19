import { Role, Department, User, Project, Task, KPI } from '@/types/models';

export const roles: Role[] = [
  { id: 1, name: 'ADMIN' },
  { id: 2, name: 'DEPT_HEAD' },
  { id: 3, name: 'MANAGER' },
  { id: 4, name: 'SUPERVISOR' },
  { id: 5, name: 'EMPLOYEE' },
];

export const departments: Department[] = [
  { id: 1, name: 'Engineering', deptHeadId: 2, createdAt: '2023-01-15' },
  { id: 2, name: 'Marketing', deptHeadId: 6, createdAt: '2023-01-15' },
  { id: 3, name: 'Operations', deptHeadId: 10, createdAt: '2023-02-01' },
];

export const users: User[] = [
  // Admin
  { id: 1, fullName: 'Sarah Chen', email: 'sarah.admin@corp.com', roleId: 1, managerId: null, departmentId: null },
  // Engineering
  { id: 2, fullName: 'Marcus Wright', email: 'marcus.head@corp.com', roleId: 2, managerId: null, departmentId: 1 },
  { id: 3, fullName: 'Elena Rodriguez', email: 'elena.mgr@corp.com', roleId: 3, managerId: 2, departmentId: 1 },
  { id: 4, fullName: 'David Park', email: 'david.sup@corp.com', roleId: 4, managerId: 3, departmentId: 1 },
  { id: 5, fullName: 'Alex Rivera', email: 'alex.emp@corp.com', roleId: 5, managerId: 4, departmentId: 1 },
  // Marketing
  { id: 6, fullName: 'Jessica Liu', email: 'jessica.head@corp.com', roleId: 2, managerId: null, departmentId: 2 },
  { id: 7, fullName: 'Tom Bradley', email: 'tom.mgr@corp.com', roleId: 3, managerId: 6, departmentId: 2 },
  { id: 8, fullName: 'Nina Patel', email: 'nina.sup@corp.com', roleId: 4, managerId: 7, departmentId: 2 },
  { id: 9, fullName: 'Carlos Mendez', email: 'carlos.emp@corp.com', roleId: 5, managerId: 8, departmentId: 2 },
  // Operations
  { id: 10, fullName: 'Robert Kim', email: 'robert.head@corp.com', roleId: 2, managerId: null, departmentId: 3 },
  { id: 11, fullName: 'Amanda Foster', email: 'amanda.mgr@corp.com', roleId: 3, managerId: 10, departmentId: 3 },
  { id: 12, fullName: 'James Wilson', email: 'james.sup@corp.com', roleId: 4, managerId: 11, departmentId: 3 },
  { id: 13, fullName: 'Priya Sharma', email: 'priya.emp@corp.com', roleId: 5, managerId: 12, departmentId: 3 },
  { id: 14, fullName: 'Mike Johnson', email: 'mike.emp@corp.com', roleId: 5, managerId: 4, departmentId: 1 },
  { id: 15, fullName: 'Lisa Wang', email: 'lisa.emp@corp.com', roleId: 5, managerId: 8, departmentId: 2 },
];

export const projects: Project[] = [
  { id: 1, name: 'Q4 API Refactor', departmentId: 1, status: 'ACTIVE' },
  { id: 2, name: 'Mobile App v2', departmentId: 1, status: 'PLANNING' },
  { id: 3, name: 'Brand Refresh 2024', departmentId: 2, status: 'ACTIVE' },
  { id: 4, name: 'Social Media Campaign', departmentId: 2, status: 'ACTIVE' },
  { id: 5, name: 'Supply Chain Optimization', departmentId: 3, status: 'ACTIVE' },
  { id: 6, name: 'Warehouse Automation', departmentId: 3, status: 'PLANNING' },
  { id: 7, name: 'CI/CD Pipeline', departmentId: 1, status: 'COMPLETED' },
  { id: 8, name: 'Q1 Launch Event', departmentId: 2, status: 'ON_HOLD' },
];

export const tasks: Task[] = [
  { id: 1, projectId: 1, title: 'Optimize Database Indices', description: 'Review and optimize slow queries', assignedTo: 5, createdBy: 3, priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2024-11-30', completedAt: null },
  { id: 2, projectId: 1, title: 'API Rate Limiting', description: 'Implement rate limiting middleware', assignedTo: 14, createdBy: 3, priority: 'MEDIUM', status: 'TODO', dueDate: '2024-12-05', completedAt: null },
  { id: 3, projectId: 1, title: 'Auth Token Refresh', description: 'Fix token refresh flow', assignedTo: 5, createdBy: 4, priority: 'URGENT', status: 'REVIEW', dueDate: '2024-11-25', completedAt: null },
  { id: 4, projectId: 2, title: 'Wireframe Mobile Screens', description: 'Create wireframes for new flow', assignedTo: 14, createdBy: 3, priority: 'MEDIUM', status: 'DONE', dueDate: '2024-11-20', completedAt: '2024-11-18T10:00:00Z' },
  { id: 5, projectId: 2, title: 'Setup React Native Project', description: 'Init project and configure build', assignedTo: 5, createdBy: 3, priority: 'HIGH', status: 'TODO', dueDate: '2024-12-01', completedAt: null },
  { id: 6, projectId: 3, title: 'Design New Logo Variants', description: 'Create 3 logo concepts', assignedTo: 9, createdBy: 7, priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2024-11-28', completedAt: null },
  { id: 7, projectId: 3, title: 'Brand Guidelines Document', description: 'Write comprehensive brand guide', assignedTo: 15, createdBy: 7, priority: 'MEDIUM', status: 'BACKLOG', dueDate: '2024-12-15', completedAt: null },
  { id: 8, projectId: 4, title: 'Q4 Content Calendar', description: 'Plan social posts for Q4', assignedTo: 9, createdBy: 8, priority: 'HIGH', status: 'DONE', dueDate: '2024-11-10', completedAt: '2024-11-09T16:30:00Z' },
  { id: 9, projectId: 4, title: 'Influencer Outreach', description: 'Contact top 20 influencers', assignedTo: 15, createdBy: 7, priority: 'MEDIUM', status: 'IN_PROGRESS', dueDate: '2024-12-01', completedAt: null },
  { id: 10, projectId: 5, title: 'Vendor Audit', description: 'Audit top 10 vendor contracts', assignedTo: 13, createdBy: 11, priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '2024-11-30', completedAt: null },
  { id: 11, projectId: 5, title: 'Logistics Dashboard', description: 'Build real-time tracking dashboard', assignedTo: 13, createdBy: 12, priority: 'URGENT', status: 'TODO', dueDate: '2024-12-10', completedAt: null },
  { id: 12, projectId: 6, title: 'RFP for Robotics', description: 'Draft RFP for automation vendors', assignedTo: 13, createdBy: 11, priority: 'LOW', status: 'BACKLOG', dueDate: '2025-01-15', completedAt: null },
  { id: 13, projectId: 7, title: 'Setup GitHub Actions', description: 'Configure CI/CD pipeline', assignedTo: 5, createdBy: 3, priority: 'HIGH', status: 'DONE', dueDate: '2024-10-15', completedAt: '2024-10-14T09:00:00Z' },
  { id: 14, projectId: 7, title: 'Docker Multi-stage Build', description: 'Optimize docker images', assignedTo: 14, createdBy: 4, priority: 'MEDIUM', status: 'DONE', dueDate: '2024-10-20', completedAt: '2024-10-19T14:00:00Z' },
  { id: 15, projectId: 1, title: 'GraphQL Schema Migration', description: 'Migrate REST endpoints to GraphQL', assignedTo: 14, createdBy: 3, priority: 'LOW', status: 'BACKLOG', dueDate: '2025-01-10', completedAt: null },
];

export const kpis: KPI[] = [
  { id: 1, userId: 5, periodMonth: 10, periodYear: 2024, tasksCompleted: 14, onTimePercentage: 92.5, managerRating: 4.8 },
  { id: 2, userId: 5, periodMonth: 9, periodYear: 2024, tasksCompleted: 11, onTimePercentage: 85.0, managerRating: 4.2 },
  { id: 3, userId: 14, periodMonth: 10, periodYear: 2024, tasksCompleted: 12, onTimePercentage: 88.0, managerRating: 4.5 },
  { id: 4, userId: 14, periodMonth: 9, periodYear: 2024, tasksCompleted: 9, onTimePercentage: 78.0, managerRating: 3.8 },
  { id: 5, userId: 9, periodMonth: 10, periodYear: 2024, tasksCompleted: 10, onTimePercentage: 95.0, managerRating: 4.9 },
  { id: 6, userId: 15, periodMonth: 10, periodYear: 2024, tasksCompleted: 8, onTimePercentage: 62.5, managerRating: 3.2 },
  { id: 7, userId: 13, periodMonth: 10, periodYear: 2024, tasksCompleted: 7, onTimePercentage: 71.0, managerRating: 3.5 },
  { id: 8, userId: 9, periodMonth: 9, periodYear: 2024, tasksCompleted: 13, onTimePercentage: 91.0, managerRating: 4.7 },
  { id: 9, userId: 13, periodMonth: 9, periodYear: 2024, tasksCompleted: 6, onTimePercentage: 66.0, managerRating: 3.0 },
  { id: 10, userId: 15, periodMonth: 9, periodYear: 2024, tasksCompleted: 5, onTimePercentage: 55.0, managerRating: 2.8 },
];

// Helper functions
export const getRoleName = (roleId: number): string => roles.find(r => r.id === roleId)?.name ?? 'UNKNOWN';
export const getUserRole = (user: User) => roles.find(r => r.id === user.roleId);
export const getDepartment = (id: number) => departments.find(d => d.id === id);
export const getUser = (id: number) => users.find(u => u.id === id);
export const getUsersByDepartment = (deptId: number) => users.filter(u => u.departmentId === deptId);
export const getProjectsByDepartment = (deptId: number) => projects.filter(p => p.departmentId === deptId);
export const getTasksByProject = (projectId: number) => tasks.filter(t => t.projectId === projectId);
export const getTasksByUser = (userId: number) => tasks.filter(t => t.assignedTo === userId);
export const getKPIsByUser = (userId: number) => kpis.filter(k => k.userId === userId);
export const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
