import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import {
  LayoutDashboard, Building2, FolderKanban,
  Users, BarChart3, Shield, LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE'] },
  { label: 'Departments', path: '/departments', icon: <Building2 className="w-4 h-4" />, roles: ['ADMIN'] },
  { label: 'My Team', path: '/my-team', icon: <Users className="w-4 h-4" />, roles: ['DEPT_HEAD', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE'] },
  { label: 'Projects', path: '/projects', icon: <FolderKanban className="w-4 h-4" />, roles: ['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE'] },
  { label: 'Users', path: '/users', icon: <Users className="w-4 h-4" />, roles: ['ADMIN'] },
  { label: 'Roles', path: '/roles', icon: <Shield className="w-4 h-4" />, roles: ['ADMIN'] },
  { label: 'KPIs', path: '/kpis', icon: <BarChart3 className="w-4 h-4" />, roles: ['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR'] },
];

export const AppSidebar = () => {
  const { currentUser, currentRole, logout } = useAuth();
  const { getInitials } = useData();
  const location = useLocation();

  if (!currentUser) return null;

  return (
    <aside className="w-60 h-screen flex flex-col border-r border-white/20 bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0">
      <div className="px-4 h-14 flex items-center gap-4 border-b border-gray-800/20">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm text-sidebar-foreground">Project Tracker</span>
      </div>

      <Separator />

      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems
          .filter(item => item.roles.includes(currentRole))
          .map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="px-3 py-3"
              >
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-violet-500 text-white shadow-sm'
                      : 'text-white/85 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
      </nav>

      <div className="px-3 py-3 border-t border-white/20">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {getInitials(currentUser.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{currentUser.fullName}</p>
            <p className="text-[11px] text-white/70">{currentRole}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-white/70 hover:text-white hover:bg-white/10" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
};
