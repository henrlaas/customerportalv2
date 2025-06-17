
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MyTasksCard } from '@/components/Dashboard/UserDashboard/MyTasksCard';
import { MyDealsCard } from '@/components/Dashboard/UserDashboard/MyDealsCard';
import { TimeTrackingCard } from '@/components/Dashboard/UserDashboard/TimeTrackingCard';
import { MyProjectsCard } from '@/components/Dashboard/UserDashboard/MyProjectsCard';
import { DashboardCalendar } from '@/components/Dashboard/UserDashboard/DashboardCalendar';

const Dashboard = () => {
  const { profile, isAdmin, isEmployee, isClient } = useAuth();

  // If user is a client, redirect or show different content
  if (isClient && !isAdmin && !isEmployee) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back, {profile?.first_name}
          </h1>
          <p className="text-muted-foreground">
            Client dashboard is not yet available. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Greeting Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome back, {profile?.first_name}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your current work and progress.
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left side - 4 cards in a 2x2 grid on larger screens */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MyTasksCard />
            <MyDealsCard />
            <TimeTrackingCard />
            <MyProjectsCard />
          </div>
        </div>

        {/* Right side - Calendar */}
        <div className="lg:col-span-1">
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
