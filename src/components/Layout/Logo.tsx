
import React from 'react';

type LogoProps = {
  className?: string;
  collapsed?: boolean;
};

export const Logo: React.FC<LogoProps> = ({ className = '', collapsed = false }) => {
  return (
    <div className={`flex items-center justify-center ${className} ${collapsed ? 'scale-90' : ''}`}>
      <img 
        src="/lovable-uploads/56893e30-62e8-48f3-9577-a746295658f4.png" 
        alt="Box Logo" 
        className={`h-8 w-auto transition-all duration-200 ${collapsed ? 'mx-auto' : ''}`}
      />
    </div>
  );
};
