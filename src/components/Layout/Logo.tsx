
import React from 'react';

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`playful-logo ${className}`}>
      <img 
        src="/lovable-uploads/d7b0c9d2-fac0-45d7-8f1f-0f8977a6ced2.png" 
        alt="Logo" 
        className="playful-logo-icon"
      />
      {showText && <h1 className="playful-logo-text">Workspace</h1>}
    </div>
  );
};
