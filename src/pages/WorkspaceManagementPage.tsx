
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserManagementTab } from '@/components/WorkspaceManagement/UserManagementTab';
import { EmployeeManagementTab } from '@/components/WorkspaceManagement/EmployeeManagementTab';
import { NewsManagementTab } from '@/components/WorkspaceManagement/NewsManagementTab';
import { EmailToolsTab } from '@/components/WorkspaceManagement/EmailToolsTab';
import { SmsToolsTab } from '@/components/WorkspaceManagement/SmsToolsTab';
import { AnalyticsDashboardTab } from '@/components/WorkspaceManagement/AnalyticsDashboardTab';
import { CronJobMonitoringTab } from '@/components/WorkspaceManagement/CronJobMonitoringTab';
import { HomeTab } from '@/components/WorkspaceManagement/HomeTab';
import { AppearanceTab } from '@/components/WorkspaceManagement/AppearanceTab';

const WorkspaceManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("home");

  const handleNavigateToTab = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Workspace Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="email-tools">Email</TabsTrigger>
          <TabsTrigger value="sms-tools">SMS</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <HomeTab onNavigateToTab={handleNavigateToTab} />
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

        <TabsContent value="email-tools">
          <EmailToolsTab />
        </TabsContent>

        <TabsContent value="sms-tools">
          <SmsToolsTab />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceTab />
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
