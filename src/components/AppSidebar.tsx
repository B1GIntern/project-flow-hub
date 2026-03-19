import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { RoleName } from '@/types/models';
import {
  LayoutDashboard, Building2, FolderKanban, CheckSquare,
  Users, BarChart3,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: RoleName[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE'] },
  { label: 'Departments', path: '/departments', icon: <Building2 className="w-4 h-4" />, roles: ['ADMIN', 'DEPT_HEAD', 'MANAGER'] },
  { label: 'Projects', path: '/projects', icon: <FolderKanban className="w-4 h-4" />, roles: ['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR'] },
  { label: 'Tasks', path: '/tasks', icon: <CheckSquare className="w-4 h-4" />, roles: ['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE'] },
  { label: 'Users', path: '/users', icon: <Users className="w-4 h-4" />, roles: ['ADMIN'] },
  { label: 'KPIs', path: '/kpis', icon: <BarChart3 className="w-4 h-4" />, roles: ['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR'] },
];

export const AppSidebar = () => {
  const { currentUser, setCurrentUser, currentRole } = useAuth();
  const { users, getRoleName, getInitials } = useData();
  const location = useLocation();

  return (
    <aside className="w-60 h-screen flex flex-col border-r border-sidebar-border bg-sidebar flex-shrink-0">
      <div className="px-4 h-14 flex items-center gap-2 border-b border-sidebar-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm text-sidebar-foreground">Apex Tracker</span>
      </div>

      <div className="px-3 py-3">
        <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1.5 block">
          Switch User
        </label>
        <Select
          value={String(currentUser.id)}
          onValueChange={(val) => {
            const u = users.find(u => u.id === Number(val));
            if (u) setCurrentUser(u);
          }}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {users.map(u => (
              <SelectItem key={u.id} value={String(u.id)} className="text-xs">
                {u.fullName} · {getRoleName(u.roleId)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="px-3 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {getInitials(currentUser.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser.fullName}</p>
            <p className="text-[11px] text-muted-foreground">{currentRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
