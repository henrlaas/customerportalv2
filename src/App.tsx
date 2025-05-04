
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./contexts/AuthContext";
import { AppLayout } from "./components/Layout/AppLayout";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import Dashboard from "./pages/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import TimeTrackingPage from "./pages/TimeTrackingPage";
import Auth from "./pages/Auth";
import CompaniesPage from "./pages/CompaniesPage";
import DealsPage from "./pages/DealsPage";
import TasksPage from "./pages/TasksPage";
import ContractsPage from "./pages/ContractsPage";
import MediaPage from "./pages/MediaPage";
import FinancePage from "./pages/FinancePage";
import WorkspaceManagementPage from "./pages/WorkspaceManagementPage";
import SettingsPage from "./pages/SettingsPage";

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  const { user, loading } = useAuth();
  // Define isAuthenticated based on user existence
  const isAuthenticated = !!user;

  // Create a script element to load our custom UI JS
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/src/scripts/playful-ui.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={loading}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/time-tracking" element={<TimeTrackingPage />} />
              <Route path="/campaigns" element={<Dashboard />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/contracts" element={<ContractsPage />} />
              <Route path="/media" element={<MediaPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/workspace-management" element={<WorkspaceManagementPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
