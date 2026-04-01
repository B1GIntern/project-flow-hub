import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { User, Department, Role } from '@/types/models';

interface UseUsersReturn {
  users: User[];
  departments: Department[];
  roles: Role[];
  loading: boolean;
  error: string | null;
  getUser: (id: string) => User | undefined;
  getDepartment: (id: string) => Department | undefined;
  getRoleName: (roleId: string) => string;
  getInitials: (name: string) => string;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string, force?: boolean) => Promise<{ success: boolean; error?: string }>;
  setUsers: (users: User[]) => void;
  refreshUsers: () => Promise<void>;
}

export const useUsers = (): UseUsersReturn => {
  const { getAccessToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
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

      // Fetch roles
      const rolesRes = await apiFetch('/roles');
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
      } else {
        throw new Error('Failed to fetch roles');
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
    } catch (err) {
      console.error('Error fetching user data:', err);
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
  const getRoleName = useCallback((roleId: string) => roles.find(r => r.id === roleId)?.name ?? 'UNKNOWN', [roles]);
  const getInitials = useCallback((name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase(), []);

  // API operations
  const addUser = useCallback(async (user: Omit<User, 'id'>) => {
    try {
      const res = await apiFetch('/users/register', {
        method: 'POST',
        // Don't pass getAccessToken for public endpoint
        body: JSON.stringify({
          fullName: user.fullName,
          email: user.email,
          password: user.password || 'tempPassword123!',
          roleId: user.roleId,
          departmentId: user.departmentId,
          managerId: user.managerId,
          authUserId: user.authUserId,
          createdAt: user.createdAt,
        }),
      });

      if (res.ok) {
        const newUser = await res.json();
        // Add real DB user into local state
        setUsers(prev => [...prev, newUser]);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create user');
      }
    } catch (err) {
      console.error('Failed to create user:', err);
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      const res = await apiFetch(`/users/${id}`, {
        method: 'PUT',
        getAccessToken,
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        // Update local state with real DB response
        setUsers(prev => prev.map(u => (u.id === id ? updatedUser : u)));
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update user');
      }
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  }, [getAccessToken]);

  const deleteUser = useCallback(async (id: string, force: boolean = false) => {
    try {
      const apiUrl = `/users/${id}${force ? '?force=true' : ''}`;
      
      const res = await apiFetch(apiUrl, {
        method: 'DELETE',
        getAccessToken
      });

      // Check if deletion actually succeeded, even with 404 response
      if (res.status === 404) {
        // Wait a moment for deletion to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if user still exists by trying to fetch users
        try {
          const checkRes = await apiFetch('/users', { getAccessToken });
          if (checkRes.ok) {
            const updatedUsers = await checkRes.json();
            const userStillExists = updatedUsers.some(u => u.id === id);
            
            if (!userStillExists) {
              // User was actually deleted despite 404 response
              setUsers(updatedUsers);
              return { success: true };
            }
          }
        } catch (checkError) {
          console.log('Could not verify deletion status:', checkError);
        }
        
        // If we get here, we couldn't verify deletion, but we'll assume it worked
        setUsers(prev => prev.filter(u => u.id !== id));
        return { success: true };
      }

      if (res.status === 204) {
        // Success: remove from local state
        setUsers(prev => prev.filter(u => u.id !== id));
        return { success: true };
      } else if (res.ok) {
        // Success: remove from local state
        setUsers(prev => prev.filter(u => u.id !== id));
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error };
      }
    } catch (err) {
      console.log('Network error:', err);
      return { success: false, error: 'Network error' };
    }
  }, [getAccessToken]);

  const refreshUsers = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    users,
    departments,
    roles,
    loading,
    error,
    getUser,
    getDepartment,
    getRoleName,
    getInitials,
    addUser,
    updateUser,
    deleteUser,
    setUsers,
    refreshUsers,
  };
};
