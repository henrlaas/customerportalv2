
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from './tabs/OverviewTab';
import { CompaniesTab } from './tabs/CompaniesTab';
import { ProjectsTab } from './tabs/ProjectsTab';
import { TasksTab } from './tabs/TasksTab';
import { CampaignsTab } from './tabs/CampaignsTab';
import { DealsTab } from './tabs/DealsTab';
import { UsersTab } from './tabs/UsersTab';
import { FilesTab } from './tabs/FilesTab';

export const AnalyticsTabContent = () => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
        <TabsTrigger value="overview" className="text-xs lg:text-sm">Overview</TabsTrigger>
        <TabsTrigger value="companies" className="text-xs lg:text-sm">Companies</TabsTrigger>
        <TabsTrigger value="projects" className="text-xs lg:text-sm">Projects</TabsTrigger>
        <TabsTrigger value="tasks" className="text-xs lg:text-sm">Tasks</TabsTrigger>
        <TabsTrigger value="campaigns" className="text-xs lg:text-sm">Campaigns</TabsTrigger>
        <TabsTrigger value="deals" className="text-xs lg:text-sm">Deals</TabsTrigger>
        <TabsTrigger value="users" className="text-xs lg:text-sm">Users</TabsTrigger>
        <TabsTrigger value="files" className="text-xs lg:text-sm">Files</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
        <OverviewTab />
      </TabsContent>

      <TabsContent value="companies" className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6">
        <CompaniesTab />
      </TabsContent>

      <TabsContent value="projects" className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
        <ProjectsTab />
      </TabsContent>

      <TabsContent value="tasks" className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
        <TasksTab />
      </TabsContent>

      <TabsContent value="campaigns" className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-6">
        <CampaignsTab />
      </TabsContent>

      <TabsContent value="deals" className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-6">
        <DealsTab />
      </TabsContent>

      <TabsContent value="users" className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
        <UsersTab />
      </TabsContent>

      <TabsContent value="files" className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6">
        <FilesTab />
      </TabsContent>
    </Tabs>
  );
};
