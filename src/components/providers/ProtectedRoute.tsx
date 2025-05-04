
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const ProtectedRoute = () => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If there are role restrictions and user role doesn't match
  if (profile && profile.role === 'client') {
    // Redirect client users to client dashboard when they try to access restricted routes
    if (!location.pathname.startsWith('/client-')) {
      return <Navigate to="/client-dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
