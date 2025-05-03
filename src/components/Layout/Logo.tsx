
import React from 'react';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="/lovable-uploads/56893e30-62e8-48f3-9577-a746295658f4.png" 
        alt="Box Logo" 
        className="h-8 w-auto animate-pulse-gentle"
      />
    </div>
  );
};
