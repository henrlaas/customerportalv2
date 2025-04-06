
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Layout/Sidebar';
import { TopBar } from '@/components/Layout/TopBar';
import { 
  SidebarProvider, 
  SidebarTrigger,
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
      <div className="flex h-screen w-full bg-gray-50">
        <Sidebar />
        <SidebarInset>
          <div className="flex-1 overflow-auto">
            <div className="sticky top-0 z-10 bg-white border-b">
              <div className="flex items-center px-4 h-14">
                <SidebarTrigger className="mr-2" />
                <TopBar />
              </div>
            </div>
            <main className="p-6">{children}</main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
