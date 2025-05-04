
import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => {
  return (
    <Link to="/dashboard" className="flex items-center">
      <img 
        src="/lovable-uploads/5acc3da5-c14c-455c-890b-79bb80affd90.png" 
        alt="Logo" 
        className="h-8 w-auto"
      />
    </Link>
  );
};
