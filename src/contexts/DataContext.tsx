import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, Department, Project, Task, KPI, RoleName } from '@/types/models';
import {
  roles as seedRoles,
  departments as seedDepartments,
  users as seedUsers,
  projects as seedProjects,
  tasks as seedTasks,
  kpis as seedKpis,
} from '@/data/mockData';

interface DataContextType {
  roles: typeof seedRoles;
  departments: Department[];
  users: User[];
  projects: Project[];
  tasks: Task[];
  kpis: KPI[];
  addUser: (user: Omit<User, 'id'>) => void;
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  // helpers
  getUser: (id: number) => User | undefined;
  getDepartment: (id: number) => Department | undefined;
  getRoleName: (roleId: number) => string;
  getInitials: (name: string) => string;
  getUsersByDepartment: (deptId: number) => User[];
  getProjectsByDepartment: (deptId: number) => Project[];
  getTasksByProject: (projectId: number) => Task[];
  getTasksByUser: (userId: number) => Task[];
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>([...seedDepartments]);
  const [users, setUsers] = useState<User[]>([...seedUsers]);
  const [projects, setProjects] = useState<Project[]>([...seedProjects]);
  const [tasks, setTasks] = useState<Task[]>([...seedTasks]);
  const [kpis] = useState<KPI[]>([...seedKpis]);

  const addUser = useCallback((user: Omit<User, 'id'>) => {
    setUsers(prev => [...prev, { ...user, id: Math.max(...prev.map(u => u.id)) + 1 }]);
  }, []);

  const addDepartment = useCallback((dept: Omit<Department, 'id' | 'createdAt'>) => {
    setDepartments(prev => [
      ...prev,
      { ...dept, id: Math.max(...prev.map(d => d.id)) + 1, createdAt: new Date().toISOString() },
    ]);
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    setProjects(prev => [...prev, { ...project, id: Math.max(...prev.map(p => p.id)) + 1 }]);
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    setTasks(prev => [...prev, { ...task, id: Math.max(...prev.map(t => t.id)) + 1 }]);
  }, []);

  const updateTask = useCallback((id: number, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const getUser = useCallback((id: number) => users.find(u => u.id === id), [users]);
  const getDepartment = useCallback((id: number) => departments.find(d => d.id === id), [departments]);
  const getRoleName = useCallback((roleId: number) => seedRoles.find(r => r.id === roleId)?.name ?? 'UNKNOWN', []);
  const getInitials = useCallback((name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase(), []);
  const getUsersByDepartment = useCallback((deptId: number) => users.filter(u => u.departmentId === deptId), [users]);
  const getProjectsByDepartment = useCallback((deptId: number) => projects.filter(p => p.departmentId === deptId), [projects]);
  const getTasksByProject = useCallback((projectId: number) => tasks.filter(t => t.projectId === projectId), [tasks]);
  const getTasksByUser = useCallback((userId: number) => tasks.filter(t => t.assignedTo === userId), [tasks]);

  return (
    <DataContext.Provider
      value={{
        roles: seedRoles,
        departments, users, projects, tasks, kpis,
        addUser, addDepartment, addProject, addTask, updateTask,
        getUser, getDepartment, getRoleName, getInitials,
        getUsersByDepartment, getProjectsByDepartment, getTasksByProject, getTasksByUser,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
};
