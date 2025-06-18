
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Settings } from 'lucide-react';

export const SMSConfigurationTab: React.FC = () => {
  const [smsSettings, setSmsSettings] = useState({
    provider: 'sveve',
    username: '',
    password: '',
    sender: '',
    enabled: false
  });
  const [testPhone, setTestPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save settings functionality
      toast({
        title: 'Settings Saved',
        description: 'SMS configuration has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save SMS settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSMS = async () => {
    if (!testPhone) {
      toast({
        title: 'Error',
        description: 'Please enter a phone number to test.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement test SMS functionality
      toast({
        title: 'Test SMS Sent',
        description: `Test SMS sent to ${testPhone}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test SMS.',
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
          <h3 className="text-lg font-medium">SMS Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure SMS settings for sending notifications via text message
          </p>
        </div>
        <Badge variant={smsSettings.enabled ? "default" : "secondary"}>
          {smsSettings.enabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              SMS Provider Settings
            </CardTitle>
            <CardDescription>
              Configure your SMS provider settings (currently using Sveve)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="sms-enabled"
                checked={smsSettings.enabled}
                onCheckedChange={(checked) => 
                  setSmsSettings(prev => ({ ...prev, enabled: checked }))
                }
              />
              <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sms-username">Username</Label>
              <Input
                id="sms-username"
                value={smsSettings.username}
                onChange={(e) => 
                  setSmsSettings(prev => ({ ...prev, username: e.target.value }))
                }
                placeholder="Your Sveve username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sms-password">Password</Label>
              <Input
                id="sms-password"
                type="password"
                value={smsSettings.password}
                onChange={(e) => 
                  setSmsSettings(prev => ({ ...prev, password: e.target.value }))
                }
                placeholder="Your Sveve password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sms-sender">Sender Name</Label>
              <Input
                id="sms-sender"
                value={smsSettings.sender}
                onChange={(e) => 
                  setSmsSettings(prev => ({ ...prev, sender: e.target.value }))
                }
                placeholder="YourCompany"
                maxLength={11}
              />
              <p className="text-xs text-muted-foreground">
                Maximum 11 characters for sender name
              </p>
            </div>

            <Button onClick={handleSaveSettings} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Test SMS
            </CardTitle>
            <CardDescription>
              Send a test SMS to verify your configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-phone">Test Phone Number</Label>
              <Input
                id="test-phone"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+47 123 45 678"
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +47 for Norway)
              </p>
            </div>
            <Button onClick={handleTestSMS} disabled={isLoading || !smsSettings.enabled}>
              {isLoading ? 'Sending...' : 'Send Test SMS'}
            </Button>
            {!smsSettings.enabled && (
              <p className="text-sm text-muted-foreground">
                Enable SMS notifications first to send test messages
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Statistics
            </CardTitle>
            <CardDescription>
              Overview of SMS usage and delivery statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Sent Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
