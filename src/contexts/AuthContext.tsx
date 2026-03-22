import React, { createContext, useContext, useState } from 'react';
import { User, RoleName } from '@/types/models';
import { useData } from '@/contexts/DataContext';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  currentRole: string;
  hasAccess: (allowedRoles: string[]) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, getRoleName } = useData();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const currentRole = currentUser ? getRoleName(currentUser.roleId) : '';
  const isAuthenticated = currentUser !== null;

  const hasAccess = (allowedRoles: string[]) => allowedRoles.includes(currentRole);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, currentRole, hasAccess, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
