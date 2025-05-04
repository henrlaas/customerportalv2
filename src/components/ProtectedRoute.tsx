
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isLoading: boolean;
  allowedRoles?: Array<'admin' | 'employee' | 'client'>;
};

export const ProtectedRoute = ({ 
  children, 
  isAuthenticated, 
  isLoading, 
  allowedRoles 
}: ProtectedRouteProps) => {
  const { profile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If there are role restrictions and user role doesn't match
  if (allowedRoles && profile && !allowedRoles.includes(profile.role as any)) {
    console.log(`Access denied: User has role ${profile?.role} but needs one of ${allowedRoles.join(', ')}`);
    
    // Redirect client users to client dashboard when they try to access restricted routes
    if (profile.role === 'client') {
      return <Navigate to="/client-dashboard" replace />;
    }
    
    // Admin and employee users should access the agency dashboard
    if (profile.role === 'admin' || profile.role === 'employee') {
      return <Navigate to="/dashboard" replace />;
    }
    
    // Redirect other unauthorized users to the unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
