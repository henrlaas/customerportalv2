import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import SetPassword from '@/pages/SetPassword';
import { AppLayout } from '@/components/Layout/AppLayout';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from './components/providers/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import ThemeProvider from '@/components/providers/ThemeProvider';
import TasksPage from '@/pages/TasksPage';
import TaskDetailPage from '@/pages/TaskDetailPage';
import CompaniesPage from '@/pages/CompaniesPage';
import CompanyDetailsPage from '@/pages/CompanyDetailsPage';
import TimeTrackingPage from '@/pages/TimeTrackingPage';
import CampaignsPage from '@/pages/CampaignsPage';
import { CampaignDetailsPage } from '@/pages/CampaignDetailsPage';
import ClientDashboardPage from '@/pages/ClientDashboardPage';
import ClientCompanyDetailsPage from '@/pages/ClientCompanyDetailsPage';
import DealsPage from '@/pages/DealsPage';
import ContractsPage from '@/pages/ContractsPage';
import SettingsPage from '@/pages/SettingsPage';
import WorkspaceManagementPage from '@/pages/WorkspaceManagementPage';
import MediaPage from '@/pages/MediaPage';
import FinancePage from '@/pages/FinancePage';
import Unauthorized from '@/pages/Unauthorized';
import NotFound from '@/pages/NotFound';
import { supabase } from '@/integrations/supabase/client';
import { AdSetDetailsPage } from './pages/AdSetDetailsPage';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';
import AdDetailsPage from '@/pages/AdDetailsPage';

// Create a component to handle Featurebase script initialization
function FeaturebaseScript() {
  return (
    <script
      src="https://do.featurebase.app/js/sdk.js"
      id="featurebase-sdk"
    ></script>
  );
}

// Create a component to handle bucket initialization
function StorageInitializer() {
  const { toast } = useToast();

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    }
    
    async function initializeStorage() {
      try {
        // First verify authentication
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          console.log('User not authenticated, skipping bucket initialization');
          return;
        }
        
        // List the available buckets
        console.log('Checking available storage buckets...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          console.error('Error listing storage buckets:', listError);
          return;
        }
        
        console.log('Available buckets:', buckets?.map(b => b.name).join(', ') || 'None');
      } catch (error) {
        console.error('Error initializing storage:', error);
      }
    }
    
    initializeStorage();
  }, [toast]);
  
  return null;
}

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <StorageInitializer />
            <FeaturebaseScript />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sign-in" element={<Auth />} />
              <Route path="/set-password" element={<SetPassword />} />
              {/* Add ad details page route */}
              <Route path="/ads/:adId" element={<AdDetailsPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={
                  <AppLayout>
                    <Outlet />
                  </AppLayout>
                }>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
                  <Route path="/companies" element={<CompaniesPage />} />
                  <Route path="/companies/:companyId" element={<CompanyDetailsPage />} />
                  <Route path="/time-tracking" element={<TimeTrackingPage />} />
                  <Route path="/campaigns" element={<CampaignsPage />} />
                  <Route path="/campaigns/:campaignId" element={<CampaignDetailsPage />} />
                  <Route path="/adsets/:adsetId" element={<AdSetDetailsPage />} />
                  <Route path="/client-dashboard" element={<ClientDashboardPage />} />
                  <Route path="/client-company/:companyId" element={<ClientCompanyDetailsPage />} />
                  <Route path="/deals" element={<DealsPage />} />
                  <Route path="/contracts" element={<ContractsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/workspace-management" element={<WorkspaceManagementPage />} />
                  <Route path="/media" element={<MediaPage />} />
                  <Route path="/finance" element={<FinancePage />} />
                </Route>
              </Route>
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </ThemeProvider>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
