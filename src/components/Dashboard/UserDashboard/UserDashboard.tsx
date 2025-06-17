
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NewsCard } from './NewsCard';
import { MyTasksCard } from './MyTasksCard';
import { MyDealsCard } from './MyDealsCard';
import { TimeTrackingCard } from './TimeTrackingCard';
import { MyProjectsCard } from './MyProjectsCard';
import { UpcomingDeadlinesCalendar } from './UpcomingDeadlinesCalendar';

export function UserDashboard() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Greeting */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.first_name} 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your work today.
        </p>
      </div>

      {/* Main Dashboard Content */}
      <div className="flex h-full">
        {/* Left Side - Cards Grid */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* News Card - spans 2 columns */}
            <div className="md:col-span-2">
              <NewsCard />
            </div>
            
            {/* My Tasks Card */}
            <div>
              <MyTasksCard />
            </div>
            
            {/* My Deals Card */}
            <div>
              <MyDealsCard />
            </div>
            
            {/* Time Tracking Card */}
            <div>
              <TimeTrackingCard />
            </div>
            
            {/* My Projects Card */}
            <div>
              <MyProjectsCard />
            </div>
          </div>
        </div>

        {/* Right Side - Vertical Calendar */}
        <div className="w-80 border-l border-gray-200 bg-white">
          <UpcomingDeadlinesCalendar />
        </div>
      </div>
    </div>
  );
}
