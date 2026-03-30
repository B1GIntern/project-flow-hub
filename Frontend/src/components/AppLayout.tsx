import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Building2, FolderKanban, Users, Shield, BarChart3 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import {
  LogOut,
} from 'lucide-react';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { currentUser, currentRole, logout } = useAuth();
  const { getInitials } = useData();
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownOpen && !(event.target as Element).closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#2D2A3E] flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-white hover:bg-white/10"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <h1 className="font-medium text-white">Project Tracker</h1>
        
        <div className="relative profile-dropdown">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleProfileDropdown}
            className="text-white hover:bg-white/10"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-[#A855F7] text-white text-xs">
                {getInitials(currentUser?.fullName || '')}
              </AvatarFallback>
            </Avatar>
          </Button>
          
          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
              <div className="px-3 py-2">
                <p className="font-semibold text-gray-900">{currentUser?.fullName}</p>
                <p className="text-xs text-gray-500">{currentRole}</p>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  logout();
                  setProfileDropdownOpen(false);
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={closeSidebar}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-br from-violet-500 to-purple-600 transform transition-transform duration-300 ease-in-out">
          <div className="relative h-full flex flex-col">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeSidebar}
              className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
            >
              <X className="w-5 h-5" />
            </Button>
            
            {/* Sidebar Content */}
            <div className="px-4 h-14 flex items-center gap-4 border-b border-white/20">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <Menu className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm text-white">Project Tracker</span>
            </div>

            <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto mt-2">
              {[
                { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE'] },
                { label: 'Departments', path: '/departments', icon: <Building2 className="w-4 h-4" />, roles: ['ADMIN', 'DEPT_HEAD', 'MANAGER'] },
                { label: 'Projects', path: '/projects', icon: <FolderKanban className="w-4 h-4" />, roles: ['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE'] },
                { label: 'Users', path: '/users', icon: <Users className="w-4 h-4" />, roles: ['ADMIN'] },
                { label: 'Roles', path: '/roles', icon: <Shield className="w-4 h-4" />, roles: ['ADMIN'] },
                { label: 'KPIs', path: '/kpis', icon: <BarChart3 className="w-4 h-4" />, roles: ['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR'] },
              ]
                .filter(item => currentRole && item.roles.includes(currentRole))
                .map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      onClick={closeSidebar}
                      className="relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer text-white/85 hover:bg-white/15 hover:text-white"
                    >
                      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 rounded-r"></div>}
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </a>
                  );
                })}
            </nav>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#FAF5FF] lg:ml-0">
        <div className="p-4 lg:p-6 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
};
