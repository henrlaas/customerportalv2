
import React from 'react';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className="sidebar-logo-container">
      <img 
        src="/lovable-uploads/05853c35-38f2-4d06-83e2-ff6ca2d05876.png" 
        alt="BOX Logo" 
        className="sidebar-logo-image"
      />
      {showText && <span className="sidebar-logo-text">Workspace</span>}
    </div>
  );
};
