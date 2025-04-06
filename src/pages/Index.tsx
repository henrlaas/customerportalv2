
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth page when visiting the root URL
    navigate('/auth');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Marketing Agency Portal</h1>
        <p className="text-gray-600 mb-4">Redirecting to login page...</p>
      </div>
    </div>
  );
};

export default Index;
