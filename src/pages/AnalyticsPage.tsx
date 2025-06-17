
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AnalyticsTab } from "@/components/WorkspaceManagement/AnalyticsTab";
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
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Comprehensive analytics and insights across all workspace data.
      </p>

      <AnalyticsTab />
    </div>
  );
};

export default AnalyticsPage;
