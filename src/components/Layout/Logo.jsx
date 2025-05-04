
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ showText = true }) => {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img 
        src="/lovable-uploads/d7b0c9d2-fac0-45d7-8f1f-0f8977a6ced2.png" 
        alt="Logo" 
        className="h-8 w-auto"
      />
      {showText && <span className="text-xl font-bold text-black dark:text-white">Workspace</span>}
    </Link>
  );
};

export default Logo;
