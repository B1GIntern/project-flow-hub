import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { User, Department } from '@/types/models';

interface UseKPIsReturn {
  departments: Department[];
  users: User[];
  loading: boolean;
  error: string | null;
  getDepartment: (id: string) => Department | undefined;
  getInitials: (name: string) => string;
  refreshData: () => Promise<void>;
}

export const useKPIs = (): UseKPIsReturn => {
  const { getAccessToken } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
    } catch (err) {
      console.error('Error fetching KPIs data:', err);
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
  const getDepartment = useCallback((id: string) => departments.find(d => d.id === id), [departments]);
  const getInitials = useCallback((name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase(), []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    departments,
    users,
    loading,
    error,
    getDepartment,
    getInitials,
    refreshData,
  };
};
