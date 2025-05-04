
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Layout/Sidebar';
import { 
  SidebarProvider, 
  SidebarInset
} from '@/components/ui/sidebar';

export const ClientLayout = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-white" style={{
        "--sidebar-width-icon": "4rem",
      } as React.CSSProperties}>
        <Sidebar />
        <SidebarInset className="flex-1">
          <div className="flex-1 overflow-auto">
            <header className="bg-white border-b px-6 py-4">
              <div className="container mx-auto">
                <h1 className="text-xl font-bold">Client Portal</h1>
              </div>
            </header>
            <main className="w-full overflow-x-hidden p-6">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
