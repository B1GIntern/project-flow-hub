import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { User, Department, Project, Task } from '@/types/models';

interface UseProjectsReturn {
  projects: Project[];
  tasks: Task[];
  users: User[];
  departments: Department[];
  loading: boolean;
  error: string | null;
  getUser: (id: string) => User | undefined;
  getDepartment: (id: string) => Department | undefined;
  getInitials: (name: string) => string;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

export const useProjects = (): UseProjectsReturn => {
  const { getAccessToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
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

      // Fetch tasks (requires auth)
      if (token) {
        const tasksRes = await apiFetch('/tasks', { getAccessToken });
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }
      }
    } catch (err) {
      console.error('Error fetching project data:', err);
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

  // API operations for projects
  const addProject = useCallback(async (project: Omit<Project, 'id'>) => {
    try {
      const res = await apiFetch('/projects', {
        method: 'POST',
        getAccessToken,
        body: JSON.stringify({
          name: project.name,
          departmentId: project.departmentId,
          status: project.status
        }),
      });

      if (res.ok) {
        const newProject = await res.json();
        setProjects(prev => [...prev, newProject]);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create project');
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  }, [getAccessToken]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const res = await apiFetch(`/projects/${id}`, {
        method: 'PUT',
        getAccessToken,
        body: JSON.stringify({
          name: updates.name,
          departmentId: updates.departmentId,
          status: updates.status
        }),
      });

      if (res.ok) {
        const updatedProject = await res.json();
        setProjects(prev => prev.map(p => (p.id === id ? updatedProject : p)));
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update project');
      }
    } catch (err) {
      console.error('Failed to update project:', err);
      throw err;
    }
  }, [getAccessToken]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      const res = await apiFetch(`/projects/${id}`, {
        method: 'DELETE',
        getAccessToken
      });

      if (res.ok || res.status === 204) {
        setProjects(prev => prev.filter(p => p.id !== id));
        // Also delete tasks associated with this project
        setTasks(prev => prev.filter(t => t.projectId !== id));
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete project');
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
      throw err;
    }
  }, [getAccessToken]);

  // API operations for tasks
  const addTask = useCallback(async (task: Omit<Task, 'id'>) => {
    try {
      const res = await apiFetch('/tasks', {
        method: 'POST',
        getAccessToken,
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          projectId: task.projectId,
          assignedTo: task.assignedTo,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
          createdBy: task.createdBy
        }),
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [...prev, newTask]);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create task');
      }
    } catch (err) {
      console.error('Failed to create task:', err);
      throw err;
    }
  }, [getAccessToken]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const res = await apiFetch(`/tasks/${id}`, {
        method: 'PUT',
        getAccessToken,
        body: JSON.stringify({
          title: updates.title,
          description: updates.description,
          projectId: updates.projectId,
          assignedTo: updates.assignedTo,
          priority: updates.priority,
          status: updates.status,
          dueDate: updates.dueDate,
          completedAt: updates.completedAt
        }),
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(prev => prev.map(t => (t.id === id ? updatedTask : t)));
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update task');
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  }, [getAccessToken]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const res = await apiFetch(`/tasks/${id}`, {
        method: 'DELETE',
        getAccessToken
      });

      if (res.ok || res.status === 204) {
        setTasks(prev => prev.filter(t => t.id !== id));
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
      throw err;
    }
  }, [getAccessToken]);

  const refreshProjects = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    projects,
    tasks,
    users,
    departments,
    loading,
    error,
    getUser,
    getDepartment,
    getInitials,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    refreshProjects,
  };
};
