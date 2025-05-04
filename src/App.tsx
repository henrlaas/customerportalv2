
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
              <Route path="/tasks" element={<Dashboard />} />
              <Route path="/companies" element={<Dashboard />} />
              <Route path="/deals" element={<Dashboard />} />
              <Route path="/contracts" element={<Dashboard />} />
              <Route path="/media" element={<Dashboard />} />
              <Route path="/finance" element={<Dashboard />} />
              <Route path="/workspace-management" element={<Dashboard />} />
              <Route path="/settings" element={<Dashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
