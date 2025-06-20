import { 
  Settings, 
  Users, 
  Mail, 
  UserCheck, 
  Cog, 
  MessageSquare, 
  Palette, 
  FileText,
  ArrowRight,
  Newspaper,
  Monitor,
  DollarSign,
  Home
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface HomeTabProps {
  onNavigateToTab: (tabValue: string) => void;
}

export function HomeTab({ onNavigateToTab }: HomeTabProps) {
  const navigationCards = [
    {
      title: "Pricing",
      description: "Manage pricing tiers, subscription plans, and revenue analytics. Set up different pricing models for your services.",
      icon: DollarSign,
      value: "pricing",
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600"
    },
    {
      title: "Employees",
      description: "Manage employee profiles, employment details, and payment information. Add new employees with comprehensive onboarding.",
      icon: Users,
      value: "employees",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600"
    },
    {
      title: "Users",
      description: "Special user management for edge cases. Generally, use Employee Management for regular personnel management.",
      icon: UserCheck,
      value: "users",
      color: "bg-yellow-50 border-yellow-200",
      iconColor: "text-yellow-600"
    },
    {
      title: "Email Tools",
      description: "Configure email templates, send bulk emails, and manage email communication settings for your workspace.",
      icon: Mail,
      value: "email-tools",
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600"
    },
    {
      title: "SMS Tools",
      description: "Set up SMS notifications, bulk messaging, and communication preferences for mobile outreach.",
      icon: MessageSquare,
      value: "sms-tools",
      color: "bg-indigo-50 border-indigo-200",
      iconColor: "text-indigo-600"
    },
    {
      title: "Appearance",
      description: "Customize your workspace appearance, themes, branding, and visual settings to match your organization.",
      icon: Palette,
      value: "appearance",
      color: "bg-pink-50 border-pink-200",
      iconColor: "text-pink-600"
    },
    {
      title: "Contracts",
      description: "Manage all contracts, templates, and document workflows. Track contract status and handle digital signatures.",
      icon: FileText,
      value: "contracts",
      color: "bg-orange-50 border-orange-200",
      iconColor: "text-orange-600"
    },
    {
      title: "News",
      description: "Create and manage company news and announcements that will be displayed to employees on their dashboards.",
      icon: Newspaper,
      value: "news",
      color: "bg-emerald-50 border-emerald-200",
      iconColor: "text-emerald-600"
    },
    {
      title: "System",
      description: "Monitor system usage, notification performance, and user engagement with detailed statistics.",
      icon: Monitor,
      value: "system",
      color: "bg-cyan-50 border-cyan-200",
      iconColor: "text-cyan-600"
    },
    {
      title: "Monitoring",
      description: "Monitor scheduled notification jobs, cron job executions, and system health with detailed logging.",
      icon: Monitor,
      value: "monitoring",
      color: "bg-slate-50 border-slate-200",
      iconColor: "text-slate-600"
    }
  ];

  const handleNavigateToTab = (tabValue: string) => {
    onNavigateToTab(tabValue);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">
              Welcome to Workspace Management
            </CardTitle>
            <CardDescription>
              This is your central control panel for managing all aspects of your workspace. 
              From here you can configure settings, manage personnel, customize communication tools, 
              and maintain the overall operation of your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Getting Started</h3>
              <p className="text-blue-800 text-sm">
                Navigate through the different sections using the tabs above. Each section is designed 
                to handle specific aspects of your workspace management. Start with Employee Management 
                for personnel, Pricing for revenue management, or Email Tools for communication setup.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Management Areas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {navigationCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Card key={card.value} className={`cursor-pointer transition-all hover:shadow-md ${card.color}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm mb-4">
                    {card.description}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleNavigateToTab(card.value)}
                    className="w-full"
                  >
                    Go to {card.title}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Tips Section */}
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">For New Setups</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start with Pricing to set up your revenue model</li>
                <li>• Add employees through Employee Management</li>
                <li>• Configure Email Tools for communication</li>
                <li>• Set up Appearance to match your brand</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">Regular Maintenance</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Monitor cron jobs in the Monitoring tab</li>
                <li>• Review Analytics for system performance</li>
                <li>• Manage Contracts for client agreements</li>
                <li>• Update News for team announcements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
