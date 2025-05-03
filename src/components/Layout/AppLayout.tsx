
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-8 rounded-xl bg-white shadow-playful">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-16 w-16 bg-primary/20 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-primary/20 rounded-full mb-2"></div>
            <div className="h-3 w-32 bg-primary/10 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <SidebarInset className="flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <TopBar />
            <main className="w-full overflow-x-hidden p-4 md:p-6 lg:p-8">
              {children || <Outlet />}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
