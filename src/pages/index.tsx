
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-center">Welcome to Agency Dashboard</h1>
        <p className="mb-6 text-center text-gray-600">
          Please sign in to access your dashboard
        </p>
        <div className="flex justify-center">
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
