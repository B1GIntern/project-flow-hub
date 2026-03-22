import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const API_PREFIX = '/api/v1';

function normalizeAuthUser(user: Record<string, unknown> | null): AuthUser | null {
  if (!user) return null;
  const roleName =
    (typeof user.roleName === 'string' && user.roleName ? user.roleName : null) ??
    (typeof user.role_name === 'string' && user.role_name ? user.role_name : null);
  return {
    id: user.id,
    fullName: (user.fullName ?? user.full_name) as string,
    email: user.email as string,
    roleId: user.roleId ?? user.role_id,
    roleName: roleName ?? undefined,
    managerId: user.managerId ?? user.manager_id ?? null,
    departmentId: user.departmentId ?? user.department_id ?? null,
  } as AuthUser;
}

async function resolveRoleName(user: AuthUser, token: string): Promise<AuthUser> {
  try {
    const res = await fetch(`${API_URL}${API_PREFIX}/roles`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return user;
    const roles = await res.json();
    const role = roles.find((r: { id: string }) => String(r.id) === String(user.roleId));
    return role ? { ...user, roleName: role.name } : user;
  } catch {
    return user;
  }
}

export interface AuthUser {
  id: string | number;
  fullName: string;
  email: string;
  roleId: string | number;
  roleName?: string;
  managerId: string | number | null;
  departmentId: string | null;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser) => void;
  currentRole: string;
  hasAccess: (allowedRoles: string[]) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<{
    accessToken: string | null;
    user: AuthUser | null;
    isLoading: boolean;
  }>({ accessToken: null, user: null, isLoading: true });

  const { accessToken, user: currentUser, isLoading } = authState;
  const currentRole = currentUser?.roleName ?? (currentUser ? 'UNKNOWN' : '');
  const isAuthenticated = currentUser !== null && accessToken !== null;

  const setAuth = useCallback((updates: Partial<typeof authState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  }, []);

  const setCurrentUser = useCallback((user: AuthUser) => setAuth({ user }), [setAuth]);

  const hasAccess = useCallback(
    (allowedRoles: string[]) => allowedRoles.includes(currentRole),
    [currentRole]
  );

  const getAccessToken = useCallback(() => accessToken, [accessToken]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}${API_PREFIX}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      let user = normalizeAuthUser(data.user);
      if (user && user.roleId && !user.roleName) {
        user = await resolveRoleName(user, data.accessToken);
      }
      setAuth({ accessToken: data.accessToken, user });
      return true;
    } catch {
      return false;
    }
  }, [setAuth]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}${API_PREFIX}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setAuth({ accessToken: null, user: null });
    }
  }, [setAuth]);

  useEffect(() => {
    let cancelled = false;
    const restoreSession = async () => {
      try {
        const res = await fetch(`${API_URL}${API_PREFIX}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (cancelled) return;
        if (res.ok && res.status !== 204) {
          const data = await res.json();
          let user = normalizeAuthUser(data.user);
          if (user && user.roleId && !user.roleName) {
            user = await resolveRoleName(user, data.accessToken);
          }
          setAuth({ accessToken: data.accessToken, user, isLoading: false });
          return;
        }
      } catch {
        if (cancelled) return;
      } finally {
        if (!cancelled) setAuth({ isLoading: false });
      }
    };
    restoreSession();
    return () => { cancelled = true; };
  }, [setAuth]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentRole,
        hasAccess,
        login,
        logout,
        isAuthenticated,
        isLoading,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
