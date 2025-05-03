
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Layout/Sidebar';
import { TopBar } from '@/components/Layout/TopBar';
import { 
  SidebarProvider, 
  SidebarInset
} from '@/components/ui/sidebar';
import { Outlet } from 'react-router-dom';

export type AppLayoutProps = {
  children?: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-offwhite">
        <div className="animate-pulse-soft">
          <div className="h-24 w-24 rounded-full border-4 border-t-transparent border-teal animate-spin mx-auto mb-6"></div>
          <p className="text-lg font-medium text-teal">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-offwhite">
        <Sidebar />
        <SidebarInset className="flex-1">
          <div className="flex-1 overflow-auto">
            <TopBar />
            <main className="w-full overflow-x-hidden p-6">
              {children || <Outlet />}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
