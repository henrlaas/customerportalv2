
import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => {
  return (
    <Link to="/dashboard" className="flex items-center">
      <img 
        src="/lovable-uploads/e182ec20-ac09-45b3-8323-c8a29e84c3aa.png" 
        alt="Box Logo" 
        className="h-8 w-auto"
      />
    </Link>
  );
};
