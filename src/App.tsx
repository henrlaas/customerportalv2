
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";  // Importing the default export
import TimeTrackingPage from "./pages/TimeTrackingPage";
import CompaniesPage from "./pages/CompaniesPage";
import ContractsPage from "./pages/ContractsPage";
import DealsPage from "./pages/DealsPage";
import UserManagementPage from "./pages/UserManagementPage";
import SettingsPage from "./pages/SettingsPage";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Route - Redirect to Auth if not authenticated */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/time-tracking"
              element={
                <ProtectedRoute allowedRoles={['admin', 'employee']}>
                  <TimeTrackingPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/companies"
              element={
                <ProtectedRoute allowedRoles={['admin', 'employee']}>
                  <CompaniesPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/contracts"
              element={
                <ProtectedRoute>
                  <ContractsPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/deals"
              element={
                <ProtectedRoute allowedRoles={['admin', 'employee']}>
                  <DealsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user-management"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
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
