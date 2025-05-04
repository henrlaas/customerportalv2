
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Outlet } from 'react-router-dom';
import DefaultLayout from './DefaultLayout';

export type AppLayoutProps = {
  children?: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { profile } = useAuth();

  if (!profile) {
    return <div className="flex items-center justify-center min-h-screen">Loading profile...</div>;
  }

  return (
    <DefaultLayout>
      {children || <Outlet />}
    </DefaultLayout>
  );
};
