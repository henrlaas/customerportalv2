
import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC = () => {
  return (
    <Link to="/dashboard" className="flex items-center">
      <div className="bg-blue-600 rounded p-2 mr-2">
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M8 5H16V9C16 11.2091 14.2091 13 12 13C9.79086 13 8 11.2091 8 9V5Z" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M8 14H16V19C16 20.1046 15.1046 21 14 21H10C8.89543 21 8 20.1046 8 19V14Z" 
            fill="white" 
          />
        </svg>
      </div>
      <span className="text-lg font-bold">TailAdmin</span>
    </Link>
  );
};
