
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppearance } from '@/components/AppearanceProvider';

export const AuthLogo: React.FC = () => {
  const { authLogo } = useAppearance();

  return (
    <div className="flex justify-center items-center">
      <img 
        src={authLogo}
        alt="Box Logo" 
        className="h-14 w-auto" 
      />
    </div>
  );
};
