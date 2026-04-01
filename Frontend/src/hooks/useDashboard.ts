import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { User, Department, Project, Task, KPI } from '@/types/models';

interface UseDashboardReturn {
  departments: Department[];
  users: User[];
  projects: Project[];
  tasks: Task[];
  kpis: KPI[];
  loading: boolean;
  error: string | null;
  getUser: (id: string) => User | undefined;
  getDepartment: (id: string) => Department | undefined;
  getInitials: (name: string) => string;
  refreshDashboard: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const { getAccessToken } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAccessToken();
      
      // Fetch departments
      const deptRes = await apiFetch('/departments');
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData);
      } else {
        throw new Error('Failed to fetch departments');
      }

      // Fetch users (requires auth)
      if (token) {
        const usersRes = await apiFetch('/users', { getAccessToken });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        } else if (usersRes.status === 401) {
          console.warn('Users fetch: Unauthorized - token may be expired');
        } else {
          throw new Error('Failed to fetch users');
        }
      }

      // Fetch projects
      const projectsRes = await apiFetch('/projects', token ? { getAccessToken } : undefined);
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      } else {
        throw new Error('Failed to fetch projects');
      }

      // Fetch tasks
      const tasksRes = await apiFetch('/tasks', token ? { getAccessToken } : undefined);
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      } else {
        throw new Error('Failed to fetch tasks');
      }

      // Fetch KPIs
      if (token) {
        const kpisRes = await apiFetch('/kpis', { getAccessToken });
        if (kpisRes.ok) {
          const kpisData = await kpisRes.json();
          setKpis(kpisData);
        } else if (kpisRes.status === 401) {
          console.warn('KPIs fetch: Unauthorized - token may be expired');
        } else {
          throw new Error('Failed to fetch KPIs');
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper functions
  const getUser = useCallback((id: string) => users.find(u => u.id === id), [users]);
  const getDepartment = useCallback((id: string) => departments.find(d => d.id === id), [departments]);
  const getInitials = useCallback((name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase(), []);

  const refreshDashboard = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    departments,
    users,
    projects,
    tasks,
    kpis,
    loading,
    error,
    getUser,
    getDepartment,
    getInitials,
    refreshDashboard,
  };
};
