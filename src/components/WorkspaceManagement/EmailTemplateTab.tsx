
import { useState } from "react";
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
    <title>Welcome to Box Workspace</title>
    <style>
        :root {
            --forest-green: #004743;
            --evergreen: #004743;
            --minty: #E4EDED;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        
        .logo {
            text-align: center;
            padding: 20px 0;
        }
        
        .content {
            padding: 20px;
        }
        
        h1 {
            color: #333333;
            margin-top: 0;
        }
        
        p {
            margin-bottom: 20px;
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .primary-button {
            border: 2px none var(--forest-green);
            background-color: var(--evergreen);
            color: var(--minty);
            text-align: center;
            letter-spacing: -.18px;
            object-fit: fill;
            border-radius: 15px;
            flex: 0 auto;
            justify-content: center;
            align-items: center;
            padding: 14px 32px;
            font-family: 'Arial', sans-serif;
            font-size: 18px;
            font-weight: 500;
            transition: color .2s cubic-bezier(.68, -.55, .265, 1.55);
            display: inline-flex;
            position: relative;
            overflow: hidden;
            text-decoration: none;
        }
        
        .features {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            margin: 30px 0;
        }
        
        .feature {
            flex-basis: 30%;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
            color: var(--evergreen);
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #999999;
            border-top: 1px solid #eeeeee;
            margin-top: 20px;
        }
        
        .social {
            margin: 15px 0;
        }
        
        .social a {
            display: inline-block;
            margin: 0 10px;
            color: #666666;
            text-decoration: none;
        }
        
        @media only screen and (max-width: 600px) {
            .container {
                width: 100%;
            }
            
            .feature {
                flex-basis: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://shorturl.at/7WV73" alt="Box Marketing AS" width="150" />
        </div>
<div class="content">
            <h2>Hello 👋</h2>
            
            <p>\${data.message}</p>
            <p>Thank you,<br>The Box Team</p>
        </div>
        <div class="footer">
            <p>This email was sent to you because you have an association with Box Marketing AS.</p>
            <p>© 2025 Box Marketing AS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

export const EmailTemplateTab = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const form = useForm<EmailTemplateFormValues>();

  // Load the template from the workspace settings
  useState(() => {
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
