
import React from 'react';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="h-10 w-10 bg-coral rounded-xl flex items-center justify-center shadow-soft">
        <img 
          src="/lovable-uploads/d7b0c9d2-fac0-45d7-8f1f-0f8977a6ced2.png" 
          alt="BOX Logo" 
          className="h-7 w-7 animate-pulse-soft"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white font-heading leading-none">Workspace</h1>
          <span className="text-xs opacity-75">Beautifully simple</span>
        </div>
      )}
    </div>
  );
};
