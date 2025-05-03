
import React from 'react';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src="/lovable-uploads/d7b0c9d2-fac0-45d7-8f1f-0f8977a6ced2.png" 
        alt="BOX Logo" 
        className="h-8"
      />
      {showText && <h1 className="text-xl font-bold text-gray-800">Workspace</h1>}
    </div>
  );
};
