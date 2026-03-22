import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, Department, Project, Task, KPI, Role } from '@/types/models';
import {
  roles as seedRoles,
  departments as seedDepartments,
  users as seedUsers,
  projects as seedProjects,
  tasks as seedTasks,
  kpis as seedKpis,
} from '@/data/mockData';

interface DataContextType {
  roles: Role[];
  departments: Department[];
  users: User[];
  projects: Project[];
  tasks: Task[];
  kpis: KPI[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: number, updates: Partial<User>) => void;
  deleteUser: (id: number) => void;
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>) => void;
  updateDepartment: (id: number, updates: Partial<Department>) => void;
  deleteDepartment: (id: number) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (id: number, updates: Partial<Role>) => void;
  deleteRole: (id: number) => void;
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
  const [roles, setRoles] = useState<Role[]>([...seedRoles]);
  const [departments, setDepartments] = useState<Department[]>([...seedDepartments]);
  const [users, setUsers] = useState<User[]>([...seedUsers]);
  const [projects, setProjects] = useState<Project[]>([...seedProjects]);
  const [tasks, setTasks] = useState<Task[]>([...seedTasks]);
  const [kpis] = useState<KPI[]>([...seedKpis]);

  const addUser = useCallback((user: Omit<User, 'id'>) => {
    setUsers(prev => [...prev, { ...user, id: Math.max(...prev.map(u => u.id)) + 1 }]);
  }, []);
  const updateUser = useCallback((id: number, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
  }, []);
  const deleteUser = useCallback((id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const addDepartment = useCallback((dept: Omit<Department, 'id' | 'createdAt'>) => {
    setDepartments(prev => [
      ...prev,
      { ...dept, id: Math.max(...prev.map(d => d.id)) + 1, createdAt: new Date().toISOString() },
    ]);
  }, []);
  const updateDepartment = useCallback((id: number, updates: Partial<Department>) => {
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  }, []);
  const deleteDepartment = useCallback((id: number) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
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
  const deleteTask = useCallback((id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const addRole = useCallback((role: Omit<Role, 'id'>) => {
    setRoles(prev => [...prev, { ...role, id: Math.max(...prev.map(r => r.id)) + 1 }]);
  }, []);
  const updateRole = useCallback((id: number, updates: Partial<Role>) => {
    setRoles(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  }, []);
  const deleteRole = useCallback((id: number) => {
    setRoles(prev => prev.filter(r => r.id !== id));
  }, []);

  const getUser = useCallback((id: number) => users.find(u => u.id === id), [users]);
  const getDepartment = useCallback((id: number) => departments.find(d => d.id === id), [departments]);
  const getRoleName = useCallback((roleId: number) => roles.find(r => r.id === roleId)?.name ?? 'UNKNOWN', [roles]);
  const getInitials = useCallback((name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase(), []);
  const getUsersByDepartment = useCallback((deptId: number) => users.filter(u => u.departmentId === deptId), [users]);
  const getProjectsByDepartment = useCallback((deptId: number) => projects.filter(p => p.departmentId === deptId), [projects]);
  const getTasksByProject = useCallback((projectId: number) => tasks.filter(t => t.projectId === projectId), [tasks]);
  const getTasksByUser = useCallback((userId: number) => tasks.filter(t => t.assignedTo === userId), [tasks]);

  return (
    <DataContext.Provider
      value={{
        roles, departments, users, projects, tasks, kpis,
        addUser, updateUser, deleteUser,
        addDepartment, updateDepartment, deleteDepartment,
        addProject, addTask, updateTask, deleteTask,
        addRole, updateRole, deleteRole,
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
