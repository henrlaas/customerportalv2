
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AnalyticsTabContent } from "@/components/Analytics/AnalyticsTabContent";

const AnalyticsPage = () => {
  const { isAdmin } = useAuth();

  // Only admins can access this page
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics
        </h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Comprehensive analytics and insights across all workspace data with interactive visualizations.
      </p>

      <AnalyticsTabContent />
    </div>
  );
};

export default AnalyticsPage;
