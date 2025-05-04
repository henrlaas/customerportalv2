
import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => {
  return (
    <Link to="/dashboard" className="flex items-center">
      <img 
        src="/lovable-uploads/26aad006-14d6-4362-842f-d9e904497027.png" 
        alt="Logo" 
        className="h-10 w-auto"
      />
    </Link>
  );
};
