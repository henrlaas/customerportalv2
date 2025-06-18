
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Home, 
  DollarSign, 
  Users, 
  UserCheck, 
  Mail, 
  MessageSquare, 
  Palette, 
  FileText, 
  Newspaper,
  Monitor,
  Activity
} from 'lucide-react';
import { UserManagementTab } from '@/components/WorkspaceManagement/UserManagementTab';
import { EmployeeManagementTab } from '@/components/WorkspaceManagement/EmployeeManagementTab';
import { NewsManagementTab } from '@/components/WorkspaceManagement/NewsManagementTab';
import { EmailToolsTab } from '@/components/WorkspaceManagement/EmailToolsTab';
import { SmsToolsTab } from '@/components/WorkspaceManagement/SmsToolsTab';
import { SystemDashboardTab } from '@/components/WorkspaceManagement/SystemDashboardTab';
import { CronJobMonitoringTab } from '@/components/WorkspaceManagement/CronJobMonitoringTab';
import { HomeTab } from '@/components/WorkspaceManagement/HomeTab';
import { AppearanceTab } from '@/components/WorkspaceManagement/AppearanceTab';
import { PricingTab } from '@/components/WorkspaceManagement/PricingTab';
import { ContractsTab } from '@/components/WorkspaceManagement/ContractsTab';

const WorkspaceManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("home");

  const handleNavigateToTab = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Workspace Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap justify-start gap-1 h-auto p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="home" className="flex items-center gap-2 px-3 py-2 text-sm">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2 px-3 py-2 text-sm">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Pricing</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2 px-3 py-2 text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Employees</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2 px-3 py-2 text-sm">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="email-tools" className="flex items-center gap-2 px-3 py-2 text-sm">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="sms-tools" className="flex items-center gap-2 px-3 py-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">SMS</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 px-3 py-2 text-sm">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2 px-3 py-2 text-sm">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Contracts</span>
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2 px-3 py-2 text-sm">
            <Newspaper className="h-4 w-4" />
            <span className="hidden sm:inline">News</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2 px-3 py-2 text-sm">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2 px-3 py-2 text-sm">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Monitoring</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <HomeTab onNavigateToTab={handleNavigateToTab} />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingTab />
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeManagementTab />
        </TabsContent>

        <TabsContent value="users">
          <UserManagementTab />
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

        <TabsContent value="contracts">
          <ContractsTab />
        </TabsContent>

        <TabsContent value="news">
          <NewsManagementTab />
        </TabsContent>

        <TabsContent value="system">
          <SystemDashboardTab />
        </TabsContent>

        <TabsContent value="monitoring">
          <CronJobMonitoringTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkspaceManagementPage;
