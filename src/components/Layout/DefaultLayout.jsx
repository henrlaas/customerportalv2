
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { TopBar } from './TopBar';
import { useLocation } from 'react-router-dom';

const DefaultLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();

  // Auto close sidebar when navigating between pages on mobile
  useEffect(() => {
    if (windowWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location, windowWidth]);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 z-50 h-full w-72 bg-white dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-all duration-300`}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Content area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden lg:ml-72">
        {/* Topbar */}
        <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DefaultLayout;
