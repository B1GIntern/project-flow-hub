import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
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
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addDepartment: (dept: Omit<Department, 'id' | 'createdAt'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  getUser: (id: string) => User | undefined;
  getDepartment: (id: string) => Department | undefined;
  getRoleName: (roleId: string) => string;
  getInitials: (name: string) => string;
  getUsersByDepartment: (deptId: string) => User[];
  getProjectsByDepartment: (deptId: string) => Project[];
  getTasksByProject: (projectId: string) => Task[];
  getTasksByUser: (userId: string) => Task[];
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getAccessToken } = useAuth();

  const [roles, setRoles] = useState<Role[]>([...seedRoles]);
  const [departments, setDepartments] = useState<Department[]>([...seedDepartments]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [kpis] = useState<KPI[]>([...seedKpis]);

  // Fetch real data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch roles (public endpoint)
        const rolesRes = await apiFetch('/roles');
        if (rolesRes.ok) {
          const rolesData = await rolesRes.json();
          setRoles(rolesData);
        }

        // Fetch departments (public endpoint)
        const deptRes = await apiFetch('/departments');
        if (deptRes.ok) {
          const deptData = await deptRes.json();
          setDepartments(deptData);
        }

        // Fetch users (requires authentication)
        const usersRes = await apiFetch('/users', { getAccessToken });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }

        // Fetch projects (requires authentication)
        const projectsRes = await apiFetch('/projects', { getAccessToken });
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }

        // Fetch tasks (requires authentication)
        const tasksRes = await apiFetch('/tasks', { getAccessToken });
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [getAccessToken]);

  // Only addUser hits the real API — everything else stays as mock
  const addUser = useCallback(async (user: Omit<User, 'id'>) => {
    try {
      console.log('Creating user:', user);
      
      const res = await apiFetch('/users/register', {
        method: 'POST',
        // Don't pass getAccessToken for public endpoint
        body: JSON.stringify({
          fullName: user.fullName,
          email: user.email,
          password: 'tempPassword123!',
          roleId: user.roleId,
          departmentId: user.departmentId,
          managerId: user.managerId,
        }),
      });

      console.log('Response status:', res.status);
      
      if (res.ok) {
        const newUser = await res.json();
        console.log('User created successfully:', newUser);
        // Add real DB user into local state alongside mock users
        setUsers(prev => [...prev, newUser]);
      } else {
        const err = await res.json();
        console.error('Failed to create user:', err);
        alert(`Failed to create user: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to create user:', err);
      alert('Failed to create user: Network error');
    }
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const addDepartment = useCallback((dept: Omit<Department, 'id' | 'createdAt'>) => {
    setDepartments(prev => [
      ...prev,
      { ...dept, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ]);
  }, []);

  const updateDepartment = useCallback((id: string, updates: Partial<Department>) => {
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  }, []);

  const deleteDepartment = useCallback((id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    setProjects(prev => [...prev, { ...project, id: crypto.randomUUID() }]);
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    setTasks(prev => [...prev, { ...task, id: crypto.randomUUID() }]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const addRole = useCallback((role: Omit<Role, 'id'>) => {
    setRoles(prev => [...prev, { ...role, id: crypto.randomUUID() }]);
  }, []);

  const updateRole = useCallback((id: string, updates: Partial<Role>) => {
    setRoles(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteRole = useCallback((id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id));
  }, []);

  const getUser = useCallback((id: string) => users.find(u => u.id === id), [users]);
  const getDepartment = useCallback((id: string) => departments.find(d => d.id === id), [departments]);
  const getRoleName = useCallback((roleId: string) => roles.find(r => r.id === roleId)?.name ?? 'UNKNOWN', [roles]);
  const getInitials = useCallback((name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase(), []);
  const getUsersByDepartment = useCallback((deptId: string) => users.filter(u => u.departmentId === deptId), [users]);
  const getProjectsByDepartment = useCallback((deptId: string) => projects.filter(p => p.departmentId === deptId), [projects]);
  const getTasksByProject = useCallback((projectId: string) => tasks.filter(t => t.projectId === projectId), [tasks]);
  const getTasksByUser = useCallback((userId: string) => tasks.filter(t => t.assignedTo === userId), [tasks]);

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