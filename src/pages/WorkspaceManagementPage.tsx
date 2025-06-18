import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserManagementTab } from '@/components/WorkspaceManagement/UserManagementTab';
import { EmployeeManagementTab } from '@/components/WorkspaceManagement/EmployeeManagementTab';
import { NewsManagementTab } from '@/components/WorkspaceManagement/NewsManagementTab';
import { EmailConfigurationTab } from '@/components/WorkspaceManagement/EmailConfigurationTab';
import { SMSConfigurationTab } from '@/components/WorkspaceManagement/SMSConfigurationTab';
import { AnalyticsDashboardTab } from '@/components/WorkspaceManagement/AnalyticsDashboardTab';
import { CronJobMonitoringTab } from '@/components/WorkspaceManagement/CronJobMonitoringTab';

const tabs = [
  { value: "home", label: "Home" },
  { value: "users", label: "Users" },
  { value: "employees", label: "Employees" },
  { value: "news", label: "News" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "analytics", label: "Analytics" },
  { value: "monitoring", label: "Monitoring" },
];

const WorkspaceManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("home");

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Workspace Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Welcome to Workspace Management!</h2>
            <p>Use the tabs above to manage different aspects of your workspace.</p>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeManagementTab />
        </TabsContent>

        <TabsContent value="news">
          <NewsManagementTab />
        </TabsContent>

        <TabsContent value="email">
          <EmailConfigurationTab />
        </TabsContent>

        <TabsContent value="sms">
          <SMSConfigurationTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboardTab />
        </TabsContent>

        <TabsContent value="monitoring">
          <CronJobMonitoringTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkspaceManagementPage;
