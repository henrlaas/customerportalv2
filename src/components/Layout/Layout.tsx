
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Initialize sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      
      <div className="content-area" style={{
        marginLeft: sidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)'
      }}>
        <TopBar />
        {children}
      </div>
    </div>
  );
};
