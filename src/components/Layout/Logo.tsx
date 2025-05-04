
import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => {
  return (
    <Link to="/dashboard" className="logo-container">
      <div className="logo-wrapper">
        <span className="logo-text">TailAdmin</span>
      </div>
    </Link>
  );
};

export default Logo;
