
import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => {
  return (
    <Link to="/dashboard" className="flex items-center">
      <img 
        src="/lovable-uploads/14ff9260-c443-431c-b2d2-cb2e57041da7.png" 
        alt="Logo" 
        className="h-10 w-auto"
      />
    </Link>
  );
};
