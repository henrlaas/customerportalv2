
import { useAuth } from '@/contexts/AuthContext';
import { MyTasksCard } from '@/components/Dashboard/UserDashboard/MyTasksCard';
import { MyDealsCard } from '@/components/Dashboard/UserDashboard/MyDealsCard';
import { TimeTrackingCard } from '@/components/Dashboard/UserDashboard/TimeTrackingCard';
import { MyProjectsCard } from '@/components/Dashboard/UserDashboard/MyProjectsCard';
import { DashboardCalendar } from '@/components/Dashboard/UserDashboard/DashboardCalendar';

const Dashboard = () => {
  const { profile, isAdmin, isEmployee, isClient } = useAuth();

  // Redirect clients to their specific dashboard
  if (isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to your Dashboard</h1>
          <p className="text-gray-600">Client dashboard features coming soon...</p>
        </div>
      </div>
    );
  }

  // Only show this dashboard for admin and employees
  if (!isAdmin && !isEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header with Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hello, {profile?.first_name || 'User'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side - Main Content Cards (3/4 of the width) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Row - 2x2 Grid for main metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MyTasksCard />
            <MyDealsCard />
            <TimeTrackingCard />
            <MyProjectsCard />
          </div>
        </div>

        {/* Right Side - Calendar (1/4 of the width) */}
        <div className="lg:col-span-1">
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
