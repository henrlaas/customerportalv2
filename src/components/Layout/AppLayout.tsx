
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Layout/Sidebar';
import { TopBar } from '@/components/Layout/TopBar';
import { Outlet } from 'react-router-dom';
import '@/styles/custom-ui.css';

export type AppLayoutProps = {
  children?: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { profile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Function to handle sidebar collapse state
  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    // You could save the state to localStorage here if needed
  };

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading profile...</div>;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar />
        <main className="p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
