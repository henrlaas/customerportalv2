
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/Layout/AppLayout";
import { UserManagement } from "@/components/UserManagement";

// Pages
import Auth from "./pages/Auth";
import SetPassword from "./pages/SetPassword";
import Dashboard from "./pages/Dashboard";
import { TasksPage } from "./pages/TasksPage";
import TimeTrackingPage from "./pages/TimeTrackingPage";
import CompaniesPage from "./pages/CompaniesPage";
import { ContractsPage } from "./pages/ContractsPage";
import DealsPage from "./pages/DealsPage";
import UserManagementPage from "./pages/UserManagementPage";
import SettingsPage from "./pages/SettingsPage";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import CampaignsPage from "./pages/CampaignsPage";
import MediaPage from "./pages/MediaPage";
import FinancePage from "./pages/FinancePage";

const queryClient = new QueryClient();

// Helper component to redirect if an invite link brings the user to root URL
const InviteLinkHandler = () => {
  // Check URL for invite params
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('token');
  const type = queryParams.get('type');
  
  if (token && (type === 'invite' || type === 'recovery')) {
    console.log('Found invite or recovery parameters, redirecting to set-password');
    // Redirect to set-password with all params preserved
    return <Navigate to={`/set-password${window.location.search}`} replace />;
  }
  
  // If no invite params, just render normal index
  return <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<InviteLinkHandler />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/set-password" element={<SetPassword />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/campaigns"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CampaignsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TasksPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/time-tracking"
              element={
                <ProtectedRoute allowedRoles={['admin', 'employee']}>
                  <AppLayout>
                    <TimeTrackingPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/companies"
              element={
                <ProtectedRoute allowedRoles={['admin', 'employee']}>
                  <AppLayout>
                    <CompaniesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/contracts"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ContractsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/deals"
              element={
                <ProtectedRoute allowedRoles={['admin', 'employee']}>
                  <AppLayout>
                    <DealsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/media"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MediaPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/finance"
              element={
                <ProtectedRoute allowedRoles={['admin', 'employee']}>
                  <AppLayout>
                    <FinancePage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/user-management"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppLayout>
                    <UserManagementPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Add a dedicated route for adding users */}
            <Route
              path="/user-management/add"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppLayout>
                    <div className="max-w-lg mx-auto">
                      <h1 className="text-3xl font-bold mb-6">Add New User</h1>
                      <UserManagement />
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
