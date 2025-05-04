
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Layout/Sidebar';
import { TopBar } from '@/components/Layout/TopBar';
import { Outlet } from 'react-router-dom';

export type AppLayoutProps = {
  children?: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  if (!profile) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      
      <div className="main-content">
        <TopBar />
        
        <div className="page-content">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
