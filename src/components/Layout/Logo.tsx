
import React from 'react';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="h-10 w-10 flex items-center justify-center rounded-md bg-primary">
        <img 
          src="/lovable-uploads/d7b0c9d2-fac0-45d7-8f1f-0f8977a6ced2.png" 
          alt="BOX Logo" 
          className="h-6"
        />
      </div>
      {showText && <h1 className="text-xl font-bold text-black dark:text-white">Workspace</h1>}
    </div>
  );
};
