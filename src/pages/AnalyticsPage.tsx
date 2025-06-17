
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AnalyticsTabContent } from "@/components/Analytics/AnalyticsTabContent";
import { BarChart3 } from "lucide-react";

const AnalyticsPage = () => {
  const { isAdmin } = useAuth();

  // Only admins can access this page
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Comprehensive analytics and insights across all workspace data with interactive visualizations.
      </p>

      <AnalyticsTabContent />
    </div>
  );
};

export default AnalyticsPage;
