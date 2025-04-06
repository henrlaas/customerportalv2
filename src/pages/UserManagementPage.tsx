
import { UserManagement } from "@/components/UserManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const UserManagementPage = () => {
  const { isAdmin } = useAuth();

  // Only admins can access this page
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      <UserManagement />
    </div>
  );
};

export default UserManagementPage;
