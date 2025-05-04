
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Layout/Sidebar';
import { TopBar } from '@/components/Layout/TopBar';
import { Outlet } from 'react-router-dom';

export type AppLayoutProps = {
  children?: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { profile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!profile) {
    return (
      <div className="playful-d-flex playful-items-center playful-justify-center playful-h-screen">
        <div className="playful-loading-spinner"></div>
        <span className="playful-ml-2">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="playful-app">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="playful-content" style={{ marginLeft: sidebarCollapsed ? '60px' : '260px' }}>
        <TopBar onToggleSidebar={toggleSidebar} />
        <main className="playful-w-full">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
