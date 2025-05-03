
import React from 'react';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src="/lovable-uploads/a6e23681-4ab0-4b75-99d5-0b2ca020c2a0.png" 
        alt="BOX Logo" 
        className="h-8"
      />
    </div>
  );
};
