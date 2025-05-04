
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Outlet } from 'react-router-dom';
import { Layout } from './Layout';

export type AppLayoutProps = {
  children?: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div>
        <span className="ml-3">Loading profile...</span>
      </div>
    );
  }

  return (
    <Layout>
      {children || <Outlet />}
    </Layout>
  );
};
