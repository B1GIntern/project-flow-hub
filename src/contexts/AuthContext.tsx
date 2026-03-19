import React, { createContext, useContext, useState } from 'react';
import { User, RoleName } from '@/types/models';
import { users, getRoleName } from '@/data/mockData';

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentRole: RoleName;
  hasAccess: (allowedRoles: RoleName[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(users[0]); // Default: Admin
  const currentRole = getRoleName(currentUser.roleId) as RoleName;

  const hasAccess = (allowedRoles: RoleName[]) => allowedRoles.includes(currentRole);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, currentRole, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
