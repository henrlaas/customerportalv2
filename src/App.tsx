
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

import Auth from './pages/Auth';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import CampaignsPage from './pages/CampaignsPage';
import { CampaignDetailsPage } from './pages/CampaignDetailsPage';
import { AdSetDetailsPage } from './pages/AdSetDetailsPage';
import AdDetailsPage from './pages/AdDetailsPage';
import DealsPage from './pages/DealsPage';
import TimeTrackingPage from './pages/TimeTrackingPage';
import FinancePage from './pages/FinancePage';
import ContractsPage from './pages/ContractsPage';
import ContractDetailsPage from './pages/ContractDetailsPage';
import MediaPage from './pages/MediaPage';
import SettingsPage from './pages/SettingsPage';
import UserManagementPage from './pages/UserManagementPage';
import WorkspaceManagementPage from './pages/WorkspaceManagementPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import ClientCompanyDetailsPage from './pages/ClientCompanyDetailsPage';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import SetPassword from './pages/SetPassword';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';

import { ProtectedRoute } from './components/providers/ProtectedRoute';
import { ClientProtectedRoute } from './components/ClientProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import { ClientLayout } from './components/ClientLayout';
import { AuthProvider } from './contexts/AuthContext';
import TasksPage from './pages/TasksPage';

// Import TaskDetailSheet for the TaskRedirect component
import { TaskDetailSheet } from './components/Tasks/TaskDetailSheet';
import { toast } from './components/ui/use-toast';

// Create a redirect component for task URLs
const TaskRedirect = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(true);
  const navigate = useNavigate();
  
  const handleClose = (open: boolean) => {
    setIsTaskSheetOpen(open);
    if (!open) {
      navigate('/tasks');
    }
  };
  
  return (
    <>
      <TasksPage />
      <TaskDetailSheet 
        isOpen={isTaskSheetOpen} 
        onOpenChange={handleClose} 
        taskId={taskId || null} 
      />
    </>
  );
};

// Finance page redirect component
const FinanceRedirect = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    toast({
      title: "Feature not available",
      description: "The Finance page is not available yet.",
      variant: "destructive",
    });
    navigate('/dashboard');
  }, [navigate]);
  
  return null;
};

function App() {
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minutes
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="acrm-ui-theme">
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/companies" element={<CompaniesPage />} />
                  <Route path="/companies/:companyId" element={<CompanyDetailsPage />} />
                  <Route path="/campaigns" element={<CampaignsPage />} />
                  <Route path="/campaigns/:campaignId" element={<CampaignDetailsPage />} />
                  <Route path="/campaigns/:campaignId/adsets/:adsetId" element={<AdSetDetailsPage />} />
                  <Route path="/campaigns/:campaignId/adsets/:adsetId/ads/:adId" element={<AdDetailsPage />} />
                  <Route path="/adsets/:adsetId" element={<AdSetDetailsPage />} />
                  <Route path="/ads/:adId" element={<AdDetailsPage />} />
                  <Route path="/deals" element={<DealsPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
                  
                  {/* Update task routes to use our TaskRedirect component */}
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/tasks/:taskId" element={<TaskRedirect />} />
                  
                  <Route path="/time-tracking" element={<TimeTrackingPage />} />
                  {/* Replace the Finance page with the redirect component */}
                  <Route path="/finance" element={<FinanceRedirect />} />
                  <Route path="/contracts" element={<ContractsPage />} />
                  <Route path="/contracts/:contractId" element={<ContractDetailsPage />} />
                  <Route path="/media" element={<MediaPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/users" element={<UserManagementPage />} />
                  <Route path="/workspace" element={<WorkspaceManagementPage />} />
                </Route>
              </Route>
              <Route element={<ClientProtectedRoute />}>
                <Route element={<ClientLayout />}>
                  <Route path="/client" element={<ClientDashboardPage />} />
                  <Route path="/client/companies/:companyId" element={<ClientCompanyDetailsPage />} />
                  <Route path="/client/tasks" element={<TasksPage />} />
                  <Route path="/client/contracts" element={<ContractsPage />} />
                </Route>
              </Route>
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
