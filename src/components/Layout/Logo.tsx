
import React from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { useAppearance } from '@/components/AppearanceProvider';

export const Logo: React.FC = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { sidebarLogo } = useAppearance();
  
  return (
    <Link to="/dashboard" className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
      <img 
        src={sidebarLogo} 
        alt="Box Logo" 
        className="h-10 w-auto" 
      />
    </Link>
  );
};
