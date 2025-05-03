
import React from 'react';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src="/lovable-uploads/c1deb4da-53a8-4fec-92f6-1fdb20ddbedb.png" 
        alt="Brand Logo" 
        className="h-9 w-9 animate-pulse-gentle"
      />
      {showText && (
        <h1 className="text-xl font-bold text-white animate-fade-in font-sans tracking-tight">
          Workspace
        </h1>
      )}
    </div>
  );
};
