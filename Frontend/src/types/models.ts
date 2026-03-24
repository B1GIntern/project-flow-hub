export type RoleName = 'ADMIN' | 'DEPT_HEAD' | 'MANAGER' | 'SUPERVISOR' | 'EMPLOYEE' | string;

export interface Role {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  deptHeadId: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  roleId: string;
  managerId: string | null;
  departmentId: string | null;
  avatar?: string;
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';

export interface Project {
  id: string;
  name: string;
  departmentId: string;
  status: ProjectStatus;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  createdBy: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  completedAt: string | null;
}

export interface KPI {
  id: string;
  userId: string;
  periodMonth: number;
  periodYear: number;
  tasksCompleted: number;
  onTimePercentage: number;
  managerRating: number;
}
