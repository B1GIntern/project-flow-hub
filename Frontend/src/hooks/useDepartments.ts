import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { User, Department, Project } from '@/types/models';

interface UseDepartmentsReturn {
  departments: Department[];
  users: User[];
  projects: Project[];
  loading: boolean;
  error: string | null;
  getUser: (id: string) => User | undefined;
  getUsersByDepartment: (deptId: string) => User[];
  getProjectsByDepartment: (deptId: string) => Project[];
  getInitials: (name: string) => string;
  getRoleName: (roleId: string) => string;
  updateDepartment: (id: string, updates: Partial<Department>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  reassignUsers: (fromDepartmentId: string, toDepartmentId: string | null) => Promise<void>;
  refreshDepartments: () => Promise<void>;
}

export const useDepartments = (): UseDepartmentsReturn => {
  const { getAccessToken } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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
      }
    } catch (err) {
      console.error('Error fetching department data:', err);
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
  const getUsersByDepartment = useCallback((deptId: string) => users.filter(u => u.departmentId === deptId), [users]);
  const getProjectsByDepartment = useCallback((deptId: string) => projects.filter(p => p.departmentId === deptId), [projects]);
  const getInitials = useCallback((name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase(), []);
  
  // Mock role names - in real app this should come from API
  const getRoleName = useCallback((roleId: string) => {
    const roleMap: Record<string, string> = {
      '1': 'ADMIN',
      '2': 'DEPT_HEAD', 
      '3': 'MANAGER',
      '4': 'SUPERVISOR',
      '5': 'EMPLOYEE'
    };
    return roleMap[roleId] || 'UNKNOWN';
  }, []);

  // API operations
  const updateDepartment = useCallback(async (id: string, updates: Partial<Department>) => {
    try {
      const res = await apiFetch(`/departments/${id}`, {
        method: 'PUT',
        getAccessToken,
        body: JSON.stringify({
          name: updates.name,
          dept_head_id: updates.deptHeadId
        }),
      });

      if (res.ok) {
        const updatedDept = await res.json();
        setDepartments(prev => prev.map(d => (d.id === id ? updatedDept : d)));
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update department');
      }
    } catch (err) {
      console.error('Failed to update department:', err);
      throw err;
    }
  }, [getAccessToken]);

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      const res = await apiFetch(`/departments/${id}`, {
        method: 'DELETE',
        getAccessToken
      });

      if (res.ok || res.status === 204) {
        setDepartments(prev => prev.filter(d => d.id !== id));
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete department');
      }
    } catch (err) {
      console.error('Failed to delete department:', err);
      throw err;
    }
  }, [getAccessToken]);

  const reassignUsers = useCallback(async (fromDepartmentId: string, toDepartmentId: string | null) => {
    try {
      const res = await apiFetch(`/departments/${fromDepartmentId}/reassign-users`, {
        method: 'POST',
        getAccessToken,
        body: JSON.stringify({
          newDepartmentId: toDepartmentId
        }),
      });

      if (res.ok) {
        // Update local state - move users to new department or make them unassigned
        setUsers(prev => prev.map(user => 
          user.departmentId === fromDepartmentId 
            ? { ...user, departmentId: toDepartmentId }
            : user
        ));
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to reassign users');
      }
    } catch (err) {
      console.error('Failed to reassign users:', err);
      throw err;
    }
  }, [getAccessToken]);

  const refreshDepartments = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    departments,
    users,
    projects,
    loading,
    error,
    getUser,
    getUsersByDepartment,
    getProjectsByDepartment,
    getInitials,
    getRoleName,
    updateDepartment,
    deleteDepartment,
    reassignUsers,
    refreshDepartments,
  };
};
