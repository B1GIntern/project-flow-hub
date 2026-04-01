import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { Role, User } from '@/types/models';

interface UseRolesReturn {
  roles: Role[];
  users: User[];
  loading: boolean;
  error: string | null;
  addRole: (role: Omit<Role, 'id'>) => Promise<void>;
  updateRole: (id: string, updates: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  setRoles: (roles: Role[]) => void;
  refreshRoles: () => Promise<void>;
}

export const useRoles = (): UseRolesReturn => {
  const { getAccessToken } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAccessToken();
      
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
      console.error('Error fetching role data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // API operations
  const addRole = useCallback(async (role: Omit<Role, 'id'>) => {
    try {
      const res = await apiFetch('/roles', {
        method: 'POST',
        getAccessToken,
        body: JSON.stringify({
          name: role.name
        }),
      });

      if (res.ok) {
        const newRole = await res.json();
        // Add real DB role into local state
        setRoles(prev => [...prev, newRole]);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create role');
      }
    } catch (err) {
      console.error('Failed to create role:', err);
      throw err;
    }
  }, [getAccessToken]);

  const updateRole = useCallback(async (id: string, updates: Partial<Role>) => {
    try {
      const res = await apiFetch(`/roles/${id}`, {
        method: 'PUT',
        getAccessToken,
        body: JSON.stringify({
          name: updates.name
        }),
      });

      if (res.ok) {
        const updatedRole = await res.json();
        // Update local state with real DB response
        setRoles(prev => prev.map(r => (r.id === id ? updatedRole : r)));
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update role');
      }
    } catch (err) {
      console.error('Failed to update role:', err);
      throw err;
    }
  }, [getAccessToken]);

  const deleteRole = useCallback(async (id: string) => {
    try {
      const res = await apiFetch(`/roles/${id}`, {
        method: 'DELETE',
        getAccessToken
      });

      if (res.ok || res.status === 204) {
        // Remove from local state AFTER successful backend deletion
        setRoles(prev => prev.filter(r => r.id !== id));
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete role');
      }
    } catch (err) {
      console.error('Failed to delete role:', err);
      throw err;
    }
  }, [getAccessToken]);

  const refreshRoles = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    roles,
    users,
    loading,
    error,
    addRole,
    updateRole,
    deleteRole,
    setRoles,
    refreshRoles,
  };
};
