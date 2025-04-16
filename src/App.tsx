
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
import UserManagementPage from '@/pages/UserManagementPage';
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

// Create a component to handle bucket initialization
function StorageInitializer() {
  const { toast } = useToast();

  useEffect(() => {
    async function initializeStorage() {
      try {
        // Check if buckets exist
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          console.error('Error listing storage buckets:', listError);
          return;
        }
        
        const bucketNames = buckets?.map(bucket => bucket.name) || [];
        
        // Try to create campaign_media bucket if it doesn't exist
        if (!bucketNames.includes('campaign_media')) {
          try {
            const { data, error } = await supabase.storage.createBucket('campaign_media', {
              public: true,
              fileSizeLimit: 50 * 1024 * 1024, // 50MB
            });
            
            if (error) {
              // Only log as an error if it's not a "bucket already exists" error
              if (!error.message.includes('already exists')) {
                console.error('Error creating campaign_media bucket:', error);
              }
            } else {
              console.log('Campaign media bucket created successfully');
            }
          } catch (createError) {
            console.warn('Unable to create campaign_media bucket, may need admin permissions:', createError);
          }
        } else {
          console.log('Campaign media bucket already exists');
        }
        
        // Try to create attachments bucket if it doesn't exist
        if (!bucketNames.includes('attachments')) {
          try {
            const { data, error } = await supabase.storage.createBucket('attachments', {
              public: true,
              fileSizeLimit: 50 * 1024 * 1024, // 50MB
            });
            
            if (error) {
              // Only log as an error if it's not a "bucket already exists" error
              if (!error.message.includes('already exists')) {
                console.error('Error creating attachments bucket:', error);
              }
            } else {
              console.log('Attachments bucket created successfully');
            }
          } catch (createError) {
            console.warn('Unable to create attachments bucket, may need admin permissions:', createError);
          }
        } else {
          console.log('Attachments bucket already exists');
        }
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
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sign-in" element={<Auth />} />
              <Route path="/set-password" element={<SetPassword />} />
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
                  <Route path="/user-management" element={<UserManagementPage />} />
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
