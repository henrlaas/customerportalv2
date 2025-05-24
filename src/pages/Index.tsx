
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth page when visiting the root URL
    navigate('/auth', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">Box Workspace</h1>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Redirecting to login page...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
