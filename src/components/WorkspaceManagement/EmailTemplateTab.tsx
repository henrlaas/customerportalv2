import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { workspaceService } from "@/services/workspaceService";

interface EmailTemplateFormValues {
  template: string;
}

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Box Workspace</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 0 auto;">
                    <tr>
                        <td style="text-align: center; padding: 20px 0;">
                            <img src="https://shorturl.at/7WV73" alt="Box Marketing AS" width="150" style="display: block; margin: 0 auto;" />
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px;">
                            <h2 style="color: #004743; margin: 0 0 20px 0; font-size: 24px;">Hello 👋</h2>
                            <div style="margin-bottom: 20px; white-space: pre-wrap;">\${data.message}</div>
                            <p style="margin: 20px 0;">Thank you,<br>The Box Team</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding: 20px; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0 0 10px 0;">This email was sent to you because you have an association with Box Marketing AS.</p>
                            <p style="margin: 0;">© 2025 Box Marketing AS. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const EmailTemplateTab = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const form = useForm<EmailTemplateFormValues>();

  // Load the template from the workspace settings
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const settings = await workspaceService.getSettings();
        const templateSetting = settings.find(s => s.setting_key === 'email.template.default');
        
        if (templateSetting) {
          form.setValue('template', templateSetting.setting_value);
        } else {
          form.setValue('template', DEFAULT_TEMPLATE);
        }
      } catch (error) {
        console.error("Failed to load email template:", error);
        form.setValue('template', DEFAULT_TEMPLATE);
      }
    };

    fetchTemplate();
  }, [form]);

  const onSubmit = async (data: EmailTemplateFormValues) => {
    setIsSaving(true);
    try {
      // First check if the setting exists
      const settings = await workspaceService.getSettings();
      const templateSetting = settings.find(s => s.setting_key === 'email.template.default');
      
      if (templateSetting) {
        // Update existing setting
        await workspaceService.updateSetting(templateSetting.id, data.template);
      } else {
        // Create new setting
        await workspaceService.createSetting(
          'email.template.default', 
          data.template, 
          'Default email template used for sending emails'
        );
      }
      
      toast({
        title: "Template saved",
        description: "The email template has been saved successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to save template",
        description: err.message || "An error occurred while saving the template.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Alert>
        <AlertDescription>
          This template will be used when sending emails through the platform. You can use the following placeholders in your template:
          <ul className="list-disc pl-6 mt-2">
            <li><code className="bg-muted p-1 rounded">$&#123;data.message&#125;</code> - The message content</li>
            <li><code className="bg-muted p-1 rounded">$&#123;data.subject&#125;</code> - The email subject</li>
          </ul>
          <div className="mt-4 text-sm text-muted-foreground">
            <strong>Important:</strong> Use inline CSS styles only. Most email clients do not support &lt;style&gt; tags.
          </div>
        </AlertDescription>
      </Alert>
      
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle>Email Template</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HTML Template</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter HTML template code" 
                        className="min-h-[500px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Template"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
