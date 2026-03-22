import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
};
