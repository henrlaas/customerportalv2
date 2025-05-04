
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Layout/Sidebar';
import { TopBar } from '@/components/Layout/TopBar';
import { 
  SidebarProvider, 
  SidebarInset
} from '@/components/ui/sidebar';

type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { profile } = useAuth();

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading profile...</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white">
        <Sidebar />
        <SidebarInset className="flex-1">
          <div className="flex-1 overflow-auto">
            <TopBar />
            <main className="w-full overflow-x-hidden">{children}</main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
