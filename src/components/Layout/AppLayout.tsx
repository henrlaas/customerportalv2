
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-evergreen border-t-transparent mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white overflow-hidden">
        <Sidebar />
        <SidebarInset className="flex-1">
          <div className="flex-1 overflow-auto h-full">
            <TopBar />
            <main className="w-full overflow-x-hidden p-6 bg-white">
              {children || <Outlet />}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
