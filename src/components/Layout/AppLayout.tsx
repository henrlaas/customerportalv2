
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Outlet } from 'react-router-dom';
import DefaultLayout from '@/components/Layout/DefaultLayout';

export type AppLayoutProps = {
  children?: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <DefaultLayout>
      {children || <Outlet />}
    </DefaultLayout>
  );
};

export default AppLayout;
