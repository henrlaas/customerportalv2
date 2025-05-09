
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Outlet,
} from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppearanceProvider } from '@/contexts/AppearanceContext';
import { Home, Building, LineChart, CheckSquare, BarChart3, Clock, Wallet, FileText, Image, FolderKanban } from 'lucide-react';

// Use only the properly cased version and avoid importing both
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import SetPassword from '@/pages/SetPassword';
import Dashboard from '@/pages/Dashboard';
import CompaniesPage from '@/pages/CompaniesPage';
import CompanyDetailsPage from '@/pages/CompanyDetailsPage';
import DealsPage from '@/pages/DealsPage';
import TasksPage from '@/pages/TasksPage';
import TaskDetailPage from '@/pages/TaskDetailPage';
import CampaignsPage from '@/pages/CampaignsPage';
import { CampaignDetailsPage } from '@/pages/CampaignDetailsPage';
import { AdSetDetailsPage } from '@/pages/AdSetDetailsPage';
import AdDetailsPage from '@/pages/AdDetailsPage';
import TimeTrackingPage from '@/pages/TimeTrackingPage';
import SettingsPage from '@/pages/SettingsPage';
import FinancePage from '@/pages/FinancePage';
import ContractsPage from '@/pages/ContractsPage';
import MediaPage from '@/pages/MediaPage';
import WorkspaceManagementPage from '@/pages/WorkspaceManagementPage';
import UserManagementPage from '@/pages/UserManagementPage';
import ClientDashboardPage from '@/pages/ClientDashboardPage';
import ClientCompanyDetailsPage from '@/pages/ClientCompanyDetailsPage';
import Unauthorized from '@/pages/Unauthorized';
import NotFound from '@/pages/NotFound';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';

const queryClient = new QueryClient();

function AppLayout() {
  return (
    <div className="app-layout">
      <Outlet />
    </div>
  );
}

function ClientLayout() {
  return (
    <div className="client-layout">
      <Outlet />
    </div>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Navigation is handled in the effect
  }

  return <Outlet />;
}

function ClientProtectedRoute() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user && profile?.role !== 'client') {
      navigate('/unauthorized');
    }
  }, [loading, user, profile, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || profile?.role !== 'client') {
    return null; // Navigation is handled in the effect
  }

  return <Outlet />;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppearanceProvider>
            <Toaster />
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/set-password" element={<SetPassword />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/companies" element={<CompaniesPage />} />
                    <Route path="/companies/:companyId" element={<CompanyDetailsPage />} />
                    <Route path="/deals" element={<DealsPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
                    <Route path="/campaigns" element={<CampaignsPage />} />
                    <Route path="/campaigns/:campaignId" element={<CampaignDetailsPage />} />
                    <Route path="/campaigns/:campaignId/adsets/:adsetId" element={<AdSetDetailsPage />} />
                    <Route path="/campaigns/:campaignId/ads/:adId" element={<AdDetailsPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                    <Route path="/time-tracking" element={<TimeTrackingPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/finance" element={<FinancePage />} />
                    <Route path="/contracts" element={<ContractsPage />} />
                    <Route path="/media" element={<MediaPage />} />
                    <Route path="/workspace-management" element={<WorkspaceManagementPage />} />
                    <Route path="/users" element={<UserManagementPage />} />
                  </Route>
                </Route>
                <Route element={<ClientProtectedRoute />}>
                  <Route element={<ClientLayout />}>
                    <Route path="/client-dashboard" element={<ClientDashboardPage />} />
                    <Route path="/client-company" element={<ClientCompanyDetailsPage />} />
                  </Route>
                </Route>
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </AppearanceProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
