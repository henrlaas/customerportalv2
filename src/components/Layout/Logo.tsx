
import React from 'react';
import { Link } from 'react-router-dom';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <Link to="/dashboard" className={`flex items-center space-x-2 ${className}`}>
      <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white font-bold text-xl">
        W
      </div>
      {showText && <h1 className="text-xl font-bold text-gray-800">Workspace</h1>}
    </Link>
  );
};
