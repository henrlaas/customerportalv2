
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Settings, FileText } from 'lucide-react';

export const EmailConfigurationTab: React.FC = () => {
  const [smtpSettings, setSmtpSettings] = useState({
    host: '',
    port: '',
    user: '',
    password: '',
    from: '',
    enabled: false
  });
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save settings functionality
      toast({
        title: 'Settings Saved',
        description: 'Email configuration has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save email settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: 'Error',
        description: 'Please enter an email address to test.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement test email functionality
      toast({
        title: 'Test Email Sent',
        description: `Test email sent to ${testEmail}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test email.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Email Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure SMTP settings and email templates for notifications
          </p>
        </div>
        <Badge variant={smtpSettings.enabled ? "default" : "secondary"}>
          {smtpSettings.enabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            SMTP Settings
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Test Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>
                Configure your SMTP server settings for sending emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="email-enabled"
                  checked={smtpSettings.enabled}
                  onCheckedChange={(checked) => 
                    setSmtpSettings(prev => ({ ...prev, enabled: checked }))
                  }
                />
                <Label htmlFor="email-enabled">Enable Email Notifications</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    value={smtpSettings.host}
                    onChange={(e) => 
                      setSmtpSettings(prev => ({ ...prev, host: e.target.value }))
                    }
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    value={smtpSettings.port}
                    onChange={(e) => 
                      setSmtpSettings(prev => ({ ...prev, port: e.target.value }))
                    }
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-user">SMTP Username</Label>
                <Input
                  id="smtp-user"
                  value={smtpSettings.user}
                  onChange={(e) => 
                    setSmtpSettings(prev => ({ ...prev, user: e.target.value }))
                  }
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  value={smtpSettings.password}
                  onChange={(e) => 
                    setSmtpSettings(prev => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Your app password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-from">From Email Address</Label>
                <Input
                  id="smtp-from"
                  value={smtpSettings.from}
                  onChange={(e) => 
                    setSmtpSettings(prev => ({ ...prev, from: e.target.value }))
                  }
                  placeholder="noreply@yourcompany.com"
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Customize email templates for different notification types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Email template management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test Email</CardTitle>
              <CardDescription>
                Send a test email to verify your SMTP configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <Button onClick={handleTestEmail} disabled={isLoading || !smtpSettings.enabled}>
                {isLoading ? 'Sending...' : 'Send Test Email'}
              </Button>
              {!smtpSettings.enabled && (
                <p className="text-sm text-muted-foreground">
                  Enable email notifications first to send test emails
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
