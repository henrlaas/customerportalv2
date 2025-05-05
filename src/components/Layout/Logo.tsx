
import React from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';

export const Logo: React.FC = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <Link to="/dashboard" className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
      <img 
        src="/lovable-uploads/e182ec20-ac09-45b3-8323-c8a29e84c3aa.png" 
        alt="Box Logo" 
        className="h-10 w-auto" 
      />
    </Link>
  );
};
