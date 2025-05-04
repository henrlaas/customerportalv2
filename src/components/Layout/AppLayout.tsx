
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Layout/Sidebar';
import { TopBar } from '@/components/Layout/TopBar';
import { Outlet } from 'react-router-dom';

// Add types for script loading
declare global {
  interface Window {
    PlayfulUI: any;
  }
}

export type AppLayoutProps = {
  children?: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { profile } = useAuth();

  useEffect(() => {
    // Load CSS files
    const loadCssFile = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    // Load JavaScript files
    const loadJsFile = (src: string) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    };

    // Load design system files
    loadCssFile('/css/design-system.css');
    loadCssFile('/css/layout.css');
    loadCssFile('/css/components.css');
    loadCssFile('/css/dashboard.css');
    loadCssFile('/css/dark-theme.css');
    loadJsFile('/js/playfulUI.js');
    loadJsFile('/js/themeToggle.js');

    return () => {
      // Clean up if needed
    };
  }, []);

  if (!profile) {
    return (
      <div className="loading-state">
        <div className="spinner spinner-lg"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <main className="page-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
