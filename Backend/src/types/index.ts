export type RoleName = 'ADMIN' | 'DEPT_HEAD' | 'MANAGER' | 'SUPERVISOR' | 'EMPLOYEE';

export interface Role {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
  deptHeadId: number | null;
  createdAt: string;
}

export interface User {
  id: number;
  authUserId: string;
  fullName: string;
  email: string;
  roleId: number;
  managerId: number | null;
  departmentId: number | null;
  avatar?: string;
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';

export interface Project {
  id: number;
  name: string;
  departmentId: number;
  status: ProjectStatus;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  assignedTo: number;
  createdBy: number;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  completedAt: string | null;
}

export interface KPI {
  id: number;
  userId: number;
  periodMonth: number;
  periodYear: number;
  tasksCompleted: number;
  onTimePercentage: number;
  managerRating: number;
}
