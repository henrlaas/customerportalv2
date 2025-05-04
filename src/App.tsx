
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Auth from './pages/Auth';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
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
import MediaPage from './pages/MediaPage';
import SettingsPage from './pages/SettingsPage';
import UserManagementPage from './pages/UserManagementPage';
import WorkspaceManagementPage from './pages/WorkspaceManagementPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import ClientCompanyDetailsPage from './pages/ClientCompanyDetailsPage';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import SetPassword from './pages/SetPassword';
import TasksPage from './pages/TasksPage';

import { ProtectedRoute } from './components/ProtectedRoute';
import { ClientProtectedRoute } from './components/ClientProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import { ClientLayout } from './components/ClientLayout';
import { AuthProvider } from './contexts/AuthContext';

// Import TaskDetailSheet for the TaskRedirect component
import { TaskDetailSheet } from './components/Tasks/TaskDetailSheet';

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

// Import missing hooks
import { useParams, useNavigate } from 'react-router-dom';

function App() {
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/" element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/companies/:companyId" element={<CompanyDetailsPage />} />
                <Route path="/campaigns" element={<CampaignsPage />} />
                <Route path="/campaigns/:campaignId" element={<CampaignDetailsPage />} />
                <Route path="/campaigns/:campaignId/adsets/:adsetId" element={<AdSetDetailsPage />} />
                <Route path="/campaigns/:campaignId/adsets/:adsetId/ads/:adId" element={<AdDetailsPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tasks/:taskId" element={<TaskRedirect />} />
                <Route path="/time-tracking" element={<TimeTrackingPage />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/contracts" element={<ContractsPage />} />
                <Route path="/media" element={<MediaPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/users" element={<UserManagementPage />} />
                <Route path="/workspace" element={<WorkspaceManagementPage />} />
              </Route>
            </Route>
            <Route path="/" element={<ClientProtectedRoute />}>
              <Route element={<ClientLayout />}>
                <Route path="/client" element={<ClientDashboardPage />} />
                <Route path="/client/company" element={<ClientCompanyDetailsPage />} />
              </Route>
            </Route>
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
