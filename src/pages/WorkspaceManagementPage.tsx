
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { workspaceService, WorkspaceSetting } from "@/services/workspaceService";
import { SettingItem } from "@/components/WorkspaceManagement/SettingItem";
import { AddSettingForm } from "@/components/WorkspaceManagement/AddSettingForm";
import { UserManagementTab } from "@/components/WorkspaceManagement/UserManagementTab";
import { EmailToolsTab } from "@/components/WorkspaceManagement/EmailToolsTab";
import { SmsToolsTab } from "@/components/WorkspaceManagement/SmsToolsTab";
import { AppearanceTab } from "@/components/WorkspaceManagement/AppearanceTab";
import {
  Settings,
  Users,
  Mail,
  UserCog,
  Cog,
  MessageSquare,
  Palette
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { EmployeeManagementTab } from "@/components/WorkspaceManagement/EmployeeManagementTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Helper to filter settings by category
const filterSettingsByCategory = (settings: WorkspaceSetting[], category: string) => {
  return settings.filter(setting => setting.setting_key.startsWith(category));
};

const WorkspaceManagementPage = () => {
  const [settings, setSettings] = useState<WorkspaceSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const data = await workspaceService.getSettings();
        setSettings(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load workspace settings");
        console.error("Error fetching settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleUpdateSetting = async (id: string, newValue: string) => {
    try {
      await workspaceService.updateSetting(id, newValue);
      
      // Update local state
      setSettings(prev => 
        prev.map(setting => 
          setting.id === id 
            ? { ...setting, setting_value: newValue } 
            : setting
        )
      );
      
      toast({
        title: "Setting updated",
        description: "The workspace setting has been updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Failed to update setting.",
        variant: "destructive",
      });
    }
  };

  const handleAddSetting = async (key: string, value: string, description?: string) => {
    try {
      const newSetting = await workspaceService.createSetting(key, value, description);
      
      // Add to local state
      setSettings(prev => [...prev, newSetting]);
      
      toast({
        title: "Setting added",
        description: "The new workspace setting has been added successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to add setting",
        description: err.message || "An error occurred while adding the setting.",
        variant: "destructive",
      });
    }
  };

  // Get settings by category, filtering out the email.template.default
  const allSettings = settings.filter(setting => 
    setting.setting_key !== 'email.template.default' && 
    !setting.setting_key.startsWith('appearance.')
  );

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading workspace settings...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto mt-8 shadow-md rounded-xl">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Workspace Management</h1>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Configure global settings for your workspace and manage users.
      </p>

      <Tabs defaultValue="all-settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-settings">
            <Cog className="h-4 w-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Users className="h-4 w-4 mr-2" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="users">
            <UserCog className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="email-tools">
            <Mail className="h-4 w-4 mr-2" />
            Email Tools
          </TabsTrigger>
          <TabsTrigger value="sms-tools">
            <MessageSquare className="h-4 w-4 mr-2" />
            SMS Tools
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-settings" className="space-y-4">
          <div className="grid gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Pricing
            </h2>
            <p className="text-muted-foreground">
              View and manage price settings for your workspace.
            </p>
            <Separator />
          </div>

          {allSettings.length === 0 ? (
            <div className="text-center p-4 bg-muted rounded-xl shadow-sm">
              No settings found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {allSettings.map((setting) => (
                <SettingItem
                  key={setting.id}
                  setting={setting}
                  onSave={handleUpdateSetting}
                />
              ))}
            </div>
          )}
          
          <div className="mt-4">
            <AddSettingForm onAdd={handleAddSetting} />
          </div>
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
      </Tabs>
    </div>
  );
};

export default WorkspaceManagementPage;
