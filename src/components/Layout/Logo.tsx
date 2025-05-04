
import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => {
  return (
    <Link to="/dashboard" className="flex items-center">
      <img 
        src="/lovable-uploads/38e2fbe0-958f-4429-858b-9f0c97d7343c.png" 
        alt="Box Logo" 
        className="h-10 w-auto"
      />
    </Link>
  );
};
